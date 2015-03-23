var fs$1702 = require('fs'), parse$1703 = require('sexpression').parse, _$1704 = require('lodash'), find$1705 = require('recursive-readdir');
/* avoid recalculation each time */
var appCache$1706 = {};
var NOT_NULL$1708 = function (m$1757) {
    return !!m$1757;
};
var /* extracts a javascript encoded symbol for pattern matching */
S$1709 = {
    getSymbolName: function (a0$1763) {
        if (a0$1763 != null) {
            var r0$1764 = Object(a0$1763);
            if (':' in r0$1764) {
                var name$1765 = r0$1764[':'];
                return name$1765;
            }
        }
        return null;
    },
    hasInstance: function (x$1766) {
        return !!S$1709.getSymbolName(x$1766);
    },
    unapply: function (x$1767) {
        var name$1768 = S$1709.getSymbolName(x$1767);
        if (name$1768) {
            return [name$1768];
        }
    }
};
function class2Filename$1712(className$1769) {
    return className$1769.split('$')[0].replace(/\./g, '/');
}
function getPkg$1716(clazz$1770) {
    var parts$1771 = clazz$1770.split('.');
    parts$1771.pop();
    return parts$1771.join('.');
}
function matchPathNode$1718(a0$1772) {
    if ((Array.isArray ? Array.isArray(a0$1772) : Object.prototype.toString.call(a0$1772) === '[object Array]') && a0$1772.length === 3) {
        var className$1774 = a0$1772[0];
        var stmt$1775 = a0$1772[1];
        var ln$1776 = a0$1772[2];
        return {
            className: className$1774,
            filename: class2Filename$1712(className$1774),
            stmt: stmt$1775,
            line: ln$1776
        };
    }
    var x$1773 = a0$1772;
    console.log(x$1773);
    throw 'matchPathNode failed!';
    return;
}
function parseSourceSinkPaths$1722(str$1777) {
    var paths$1778 = parse$1703(str$1777);
    return _$1704.map(paths$1778, function (path$1780) {
        return _$1704.map(path$1780, matchPathNode$1718);
    });
}
function matchType$1726(a0$1781) {
    if ((Array.isArray ? Array.isArray(a0$1781) : Object.prototype.toString.call(a0$1781) === '[object Array]') && a0$1781.length === 2) {
        var r0$1783 = a0$1781[0];
        var r1$1784 = S$1709.unapply(r0$1783);
        if (r1$1784 != null && r1$1784.length === 1) {
            var r2$1785 = r1$1784[0];
            if (r2$1785 === 'array') {
                var type$1786 = a0$1781[1];
                return [matchType$1726(type$1786)];
            }
            if (r2$1785 === 'object') {
                var r3$1787 = a0$1781[1];
                var r4$1788 = S$1709.unapply(r3$1787);
                if (r4$1788 != null && r4$1788.length === 1) {
                    var className$1789 = r4$1788[0];
                    return className$1789.replace(/\//g, '.');
                }
            }
        }
    }
    var r5$1782 = S$1709.unapply(a0$1781);
    if (r5$1782 != null && r5$1782.length === 1) {
        var prim$1790 = r5$1782[0];
        return prim$1790;
    }
    throw new TypeError('No match');
}
function matchStmt$1730(a0$1791) {
    if (Array.isArray ? Array.isArray(a0$1791) : Object.prototype.toString.call(a0$1791) === '[object Array]') {
        if (a0$1791.length === 5) {
            var r0$1792 = a0$1791[0];
            var r1$1793 = S$1709.unapply(r0$1792);
            if (r1$1793 != null && r1$1793.length === 1) {
                var r2$1794 = a0$1791[2];
                var r3$1795 = S$1709.unapply(r2$1794);
                if (r3$1795 != null && (r3$1795.length === 1 && !r1$1793[0].indexOf('invoke'))) {
                    var type$1796 = r1$1793[0];
                    var regs$1797 = a0$1791[1];
                    var name$1798 = r3$1795[0];
                    var params$1799 = a0$1791[3];
                    var ret$1800 = a0$1791[4];
                    var invoke$1801 = {
                        type: type$1796,
                        name: name$1798.replace(/\//g, '.'),
                        params: _$1704.map(params$1799, matchType$1726),
                        ret: matchType$1726(ret$1800)
                    };
                    invoke$1801.signature = getMethodSigFromInvoke$1742(invoke$1801);
                    return invoke$1801;
                }
            }
        }
        if (a0$1791.length === 6) {
            var r4$1802 = a0$1791[0];
            var r5$1803 = S$1709.unapply(r4$1802);
            if (r5$1803 != null && r5$1803.length === 1) {
                var r6$1804 = a0$1791[2];
                if ((Array.isArray ? Array.isArray(r6$1804) : Object.prototype.toString.call(r6$1804) === '[object Array]') && r6$1804.length === 2) {
                    var r7$1805 = r6$1804[0];
                    var r8$1806 = S$1709.unapply(r7$1805);
                    if (r8$1806 != null && r8$1806.length === 1) {
                        var r9$1807 = r8$1806[0];
                        if (r9$1807 === 'array') {
                            var r10$1808 = a0$1791[3];
                            var r11$1809 = S$1709.unapply(r10$1808);
                            if (r11$1809 != null && r11$1809.length === 1) {
                                var type$1796 = r5$1803[0];
                                var regs$1797 = a0$1791[1];
                                var array_type$1810 = r6$1804[1];
                                var name$1798 = r11$1809[0];
                                var params$1799 = a0$1791[4];
                                var ret$1800 = a0$1791[5];
                                var invoke$1801 = {
                                    type: type$1796,
                                    name: matchType$1726(array_type$1810) + '[]' + name$1798.replace(/\//g, '.'),
                                    params: _$1704.map(params$1799, matchType$1726),
                                    ret: matchType$1726(ret$1800)
                                };
                                invoke$1801.signature = getMethodSigFromInvoke$1742(invoke$1801);
                                return invoke$1801;
                            }
                        }
                    }
                }
            }
        }
        if (a0$1791.length === 2) {
            var r12$1811 = a0$1791[0];
            var r13$1812 = S$1709.unapply(r12$1811);
            if (r13$1812 != null && r13$1812.length === 1) {
                var r14$1813 = r13$1812[0];
                if (r14$1813 === 'line') {
                    var ln$1814 = a0$1791[1];
                    return ln$1814;
                }
            }
        }
    }
    return null;
}
function matchMethodDef$1734(a0$1815) {
    if ((Array.isArray ? Array.isArray(a0$1815) : Object.prototype.toString.call(a0$1815) === '[object Array]') && a0$1815.length >= 5) {
        var r0$1816 = a0$1815[0];
        var r1$1817 = S$1709.unapply(r0$1816);
        if (r1$1817 != null && r1$1817.length === 1) {
            var r2$1818 = r1$1817[0];
            if (r2$1818 === 'method') {
                var r3$1819 = a0$1815[1];
                if ((Array.isArray ? Array.isArray(r3$1819) : Object.prototype.toString.call(r3$1819) === '[object Array]') && r3$1819.length >= 1) {
                    var r4$1820 = r3$1819[0];
                    var r5$1821 = S$1709.unapply(r4$1820);
                    if (r5$1821 != null && r5$1821.length === 1) {
                        var r6$1822 = r5$1821[0];
                        if (r6$1822 === 'attrs') {
                            var r7$1823 = [];
                            var r8$1824 = 1;
                            for (var r9$1825 = 1, r10$1826 = r3$1819.length, r11$1827; r9$1825 < r10$1826; r9$1825++) {
                                r11$1827 = r3$1819[r9$1825];
                                r7$1823[r7$1823.length] = r11$1827;
                            }
                            if (r8$1824) {
                                var r12$1828 = a0$1815[2];
                                var r13$1829 = S$1709.unapply(r12$1828);
                                if (r13$1829 != null && r13$1829.length === 1) {
                                    var r14$1830 = [];
                                    var r15$1831 = 1;
                                    for (var r16$1832 = 5, r17$1833 = a0$1815.length, r18$1834; r16$1832 < r17$1833; r16$1832++) {
                                        r18$1834 = a0$1815[r16$1832];
                                        r14$1830[r14$1830.length] = r18$1834;
                                    }
                                    if (r15$1831) {
                                        var attrs$1835 = r7$1823;
                                        var name$1836 = r13$1829[0];
                                        var params$1837 = a0$1815[3];
                                        var ret$1838 = a0$1815[4];
                                        var body$1839 = r14$1830;
                                        var lines$1840 = [];
                                        var calls$1841 = [];
                                        var stmts$1842 = _$1704.chain(body$1839).map(matchStmt$1730).filter(NOT_NULL$1708).value();
                                        _$1704.forEach(stmts$1842, function (stmt$1844) {
                                            if (typeof stmt$1844 === 'number') {
                                                lines$1840.push(stmt$1844);
                                            } else {
                                                stmt$1844.line = _$1704.last(lines$1840);
                                                calls$1841.push(stmt$1844);
                                            }
                                        });
                                        return {
                                            type: 'method',
                                            name: name$1836,
                                            startLine: lines$1840[0],
                                            endLine: _$1704.last(lines$1840),
                                            attrs: _$1704.map(attrs$1835, S$1709.getSymbolName),
                                            params: _$1704.map(params$1837, matchType$1726),
                                            ret: matchType$1726(ret$1838),
                                            calls: calls$1841
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}
function matchClass$1735(a0$1845) {
    if ((Array.isArray ? Array.isArray(a0$1845) : Object.prototype.toString.call(a0$1845) === '[object Array]') && a0$1845.length >= 5) {
        var r0$1846 = a0$1845[0];
        var r1$1847 = S$1709.unapply(r0$1846);
        if (r1$1847 != null && r1$1847.length === 1) {
            var r2$1848 = a0$1845[1];
            if ((Array.isArray ? Array.isArray(r2$1848) : Object.prototype.toString.call(r2$1848) === '[object Array]') && r2$1848.length >= 1) {
                var r3$1849 = r2$1848[0];
                var r4$1850 = S$1709.unapply(r3$1849);
                if (r4$1850 != null && r4$1850.length === 1) {
                    var r5$1851 = r4$1850[0];
                    if (r5$1851 === 'attrs') {
                        var r6$1852 = [];
                        var r7$1853 = 1;
                        for (var r8$1854 = 1, r9$1855 = r2$1848.length, r10$1856; r8$1854 < r9$1855; r8$1854++) {
                            r10$1856 = r2$1848[r8$1854];
                            r6$1852[r6$1852.length] = r10$1856;
                        }
                        if (r7$1853) {
                            var r11$1857 = a0$1845[2];
                            var r12$1858 = S$1709.unapply(r11$1857);
                            if (r12$1858 != null && r12$1858.length === 1) {
                                var r13$1859 = a0$1845[3];
                                if ((Array.isArray ? Array.isArray(r13$1859) : Object.prototype.toString.call(r13$1859) === '[object Array]') && r13$1859.length === 2) {
                                    var r14$1860 = r13$1859[0];
                                    var r15$1861 = S$1709.unapply(r14$1860);
                                    if (r15$1861 != null && r15$1861.length === 1) {
                                        var r16$1862 = r15$1861[0];
                                        if (r16$1862 === 'super') {
                                            var r17$1863 = r13$1859[1];
                                            var r18$1864 = S$1709.unapply(r17$1863);
                                            if (r18$1864 != null && r18$1864.length === 1) {
                                                var r19$1865 = a0$1845[4];
                                                if ((Array.isArray ? Array.isArray(r19$1865) : Object.prototype.toString.call(r19$1865) === '[object Array]') && r19$1865.length === 2) {
                                                    var r20$1866 = r19$1865[0];
                                                    var r21$1867 = S$1709.unapply(r20$1866);
                                                    if (r21$1867 != null && r21$1867.length === 1) {
                                                        var r22$1868 = r21$1867[0];
                                                        if (r22$1868 === 'source') {
                                                            var r23$1869 = [];
                                                            var r24$1870 = 1;
                                                            for (var r25$1871 = 5, r26$1872 = a0$1845.length, r27$1873; r25$1871 < r26$1872; r25$1871++) {
                                                                r27$1873 = a0$1845[r25$1871];
                                                                r23$1869[r23$1869.length] = r27$1873;
                                                            }
                                                            if (r24$1870 && (r1$1847[0] === 'class' || r1$1847[0] == 'interface')) {
                                                                var type$1874 = r1$1847[0];
                                                                var attrs$1875 = r6$1852;
                                                                var path$1876 = r12$1858[0];
                                                                var parent$1877 = r18$1864[0];
                                                                var file$1878 = r19$1865[1];
                                                                var members$1879 = r23$1869;
                                                                clazz = path$1876.replace(/\//g, '.');
                                                                parent$1877 = parent$1877.replace(/\//g, '.');
                                                                filename = path$1876.split('$')[0];
                                                                return {
                                                                    type: type$1874,
                                                                    file: filename,
                                                                    name: clazz,
                                                                    parent: parent$1877,
                                                                    attrs: _$1704.map(attrs$1875, S$1709.getSymbolName),
                                                                    methods: _$1704.chain(members$1879).map(matchMethodDef$1734).filter(NOT_NULL$1708).map(function (m$1881) {
                                                                        m$1881.clazz = clazz;
                                                                        m$1881.filename = filename;
                                                                        return m$1881;
                                                                    }).value()
                                                                };
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}
var onFilesDone$1738 = function (appName$1882, classes$1883, onComplete$1884) {
    var methods$1885 = {};
    var outClasses$1886 = {};
    var files$1887 = {};
    _$1704.forEach(classes$1883, function (clazz$1894) {
        outClasses$1886[clazz$1894.name] = {
            type: clazz$1894.type,
            file: clazz$1894.file,
            name: clazz$1894.name,
            parent: clazz$1894.parent,
            attrs: clazz$1894.attrs,
            methods: [],
            subClasses: []
        };
        files$1887[clazz$1894.file] = {};
        _$1704.forEach(clazz$1894.methods, function (method$1896) {
            var sig$1897 = getMethodSig$1740(method$1896);
            methods$1885[sig$1897] = method$1896;
            methods$1885[sig$1897].file = clazz$1894.file;
            outClasses$1886[clazz$1894.name].methods.push(sig$1897);
        });
    });
    /* put all parent classes into the outClasses - TODO should we pull in the source code too for java.util, etc? */
    _$1704.forEach(_$1704.clone(outClasses$1886), function (clazz$1898) {
        if (clazz$1898.parent) {
            if (!(clazz$1898.parent in outClasses$1886)) {
                outClasses$1886[clazz$1898.parent] = {
                    name: clazz$1898.parent,
                    external: true,
                    methods: [],
                    subClasses: [clazz$1898.name]
                };
            } else {
                outClasses$1886[clazz$1898.parent].subClasses.push(clazz$1898.name);
            }
        } else {
            console.log('NO PARENT FOR: ' + clazz$1898.name);
        }
    });
    function indirectSubclassesOf$1891(className$1899) {
        if (!className$1899 || !(className$1899 in outClasses$1886))
            return [];
        return /* i.e. - no known subclasses */
        _$1704.flatten(outClasses$1886[className$1899].subClasses.concat(_$1704.map(outClasses$1886[className$1899].subClasses, function (sub$1901) {
            return indirectSubclassesOf$1891(sub$1901);
        })));
    }
    _$1704.forEach(methods$1885, function (method$1902, methodSig$1903) {
        _$1704.forEach(method$1902.calls, function (invoke$1905) {
            if (invoke$1905.type == 'invoke-virtual' || invoke$1905.type == 'invoke-interface') {
                var /* add known subTypes of the called class to the calls list */
                parentClass$1906 = invoke$1905.name.split('.').slice(0, -1).join('.');
                var methodName$1907 = invoke$1905.name.split('.').pop();
                _$1704.forEach(indirectSubclassesOf$1891(parentClass$1906), function (subClass$1909) {
                    method$1902.calls.push({
                        type: invoke$1905.type,
                        name: [
                            subClass$1909,
                            methodName$1907
                        ].join('.'),
                        file: method$1902.file,
                        line: invoke$1905.line,
                        params: invoke$1905.params,
                        signature: invoke$1905.signature.replace(parentClass$1906, subClass$1909),
                        isInferred: true
                    });
                });
            }
        });
    });
    readSourcesAndSinks$1753(function (sources$1910, sinks$1911) {
        _$1704.forEach(methods$1885, function (m$1913, mSig$1914) {
            _$1704.forEach(m$1913.calls, function (invoke$1916) {
                if (invoke$1916.signature in sources$1910) {
                    if (!m$1913.risks)
                        m$1913.risks = [];
                    invoke$1916.isSource = true;
                    invoke$1916.category = sources$1910[invoke$1916.signature].category;
                    m$1913.risks.push(invoke$1916);
                    if (!(invoke$1916.line in files$1887[m$1913.file]))
                        files$1887[m$1913.file][invoke$1916.line] = [];
                    files$1887[m$1913.file][invoke$1916.line].push(invoke$1916.category);
                }
                if (invoke$1916.signature in sinks$1911) {
                    if (!m$1913.risks)
                        m$1913.risks = [];
                    invoke$1916.isSink = true;
                    invoke$1916.category = sinks$1911[invoke$1916.signature].category;
                    m$1913.risks.push(invoke$1916);
                    console.log(m$1913.file);
                    if (!(invoke$1916.line in files$1887[m$1913.file]))
                        files$1887[m$1913.file][invoke$1916.line] = [];
                    files$1887[m$1913.file][invoke$1916.line].push(invoke$1916.category);
                }
            });
        });
        appCache$1706[appName$1882] = {
            classes: outClasses$1886,
            methods: methods$1885,
            files: files$1887
        };
        onComplete$1884(appCache$1706[appName$1882]);
    });
};
function getMethodSig$1740(m$1917) {
    return [
        /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
        m$1917.clazz,
        m$1917.name
    ].join('.') + '(' + m$1917.params.join(',') + ') => ' + m$1917.ret;
}
function getMethodSigFromInvoke$1742(m$1918) {
    return m$1918.name + '(' + m$1918.params.join(',') + ') => ' + m$1918.ret;
}
function processFiles$1743(appName$1919, files$1920, classes$1921, cb$1922) {
    if (!classes$1921)
        classes$1921 = {};
    if (files$1920.length) {
        console.log(_$1704.last(files$1920));
        fs$1702.readFile(files$1920.pop(), { encoding: 'utf-8' }, function (err$1924, data$1925) {
            var clazz$1926 = matchClass$1735(parse$1703(data$1925));
            classes$1921[clazz$1926.name] = clazz$1926;
            processFiles$1743(appName$1919, files$1920, classes$1921, cb$1922);
        });
    } else {
        onFilesDone$1738(appName$1919, classes$1921, cb$1922);
    }
}
var NOT_EMPTY$1745 = function (m$1927) {
    return m$1927 != '';
};
function parseSourceSinkLine$1748(ln$1928) {
    var m$1929 = /\s*<([^:]*):\s(\S+)\s(\S+)\(([^)]*)\)>\s*((?:\S+\s+)*)\(([^)]+)\)\s*/.exec(ln$1928);
    if (m$1929) {
        m$1929 = m$1929.slice(1);
        return {
            // matched groups 
            clazz: m$1929[0],
            ret: m$1929[1],
            name: m$1929[2],
            params: _$1704.filter(m$1929[3].split(','), NOT_EMPTY$1745),
            permissions: m$1929[4].split(' '),
            category: m$1929[5].replace('NO_CATEGORY', 'GENERAL').replace('_INFORMATION', '').replace('SYNCHRONIZATION', 'SYNC')
        };
    } else {
        console.log('Ignoring source/sink line: ' + ln$1928);
    }
}
function parseSourceSinkList$1749(path$1930, onComplete$1931) {
    fs$1702.readFile(path$1930, { encoding: 'utf-8' }, function (err$1933, data$1934) {
        if (!!err$1933)
            throw err$1933;
        var lines$1935 = data$1934.split('\n');
        var parsed$1936 = _$1704.chain(lines$1935).map(parseSourceSinkLine$1748).filter(NOT_NULL$1708).value();
        onComplete$1931(parsed$1936);
    });
}
var cachedSources$1750;
var cachedSinks$1751;
function readSourcesAndSinks$1753(onComplete$1937) {
    if (!!cachedSources$1750 && !!cachedSinks$1751) {
        onComplete$1937(cachedSources$1750, cachedSinks$1751);
        return;
    }
    parseSourceSinkList$1749('data/sources_list', function (sources$1939) {
        parseSourceSinkList$1749('data/sinks_list', function (sinks$1941) {
            var outSources$1942 = {};
            var outSinks$1943 = {};
            _$1704.forEach(sources$1939, function (src$1946) {
                outSources$1942[getMethodSig$1740(src$1946)] = src$1946;
            });
            _$1704.forEach(sinks$1941, function (sink$1947) {
                outSinks$1943[getMethodSig$1740(sink$1947)] = sink$1947;
            });
            cachedSources$1750 = outSources$1942;
            cachedSinks$1751 = outSinks$1943;
            onComplete$1937(outSources$1942, outSinks$1943);
        });
    });
}
var cachedSourceSinkPaths$1754 = {};
exports.getSourceSinkPaths = function (appName$1948, path$1949, files$1950, callback$1951) {
    if (appName$1948 in cachedSourceSinkPaths$1754) {
        callback$1951(cachedSourceSinkPaths$1754[appName$1948]);
        return;
    }
    fs$1702.readFile(path$1949, { encoding: 'utf-8' }, function (err$1953, data$1954) {
        if (!!err$1953)
            throw err$1953;
        var paths$1955 = parseSourceSinkPaths$1722(data$1954);
        // TODO add categories sources and sinks here
        _$1704.forEach(paths$1955, function (path$1957) {
            var src$1958 = path$1957[0];
            var snk$1959 = path$1957[path$1957.length - 1];
            console.log(src$1958.filename);
            src$1958.category = files$1950[src$1958.filename][src$1958.line];
            if (src$1958.category && src$1958.category.length > 1) {
                console.log(src$1958.filename, src$1958.line, src$1958.category);
            }
            snk$1959.category = files$1950[snk$1959.filename][snk$1959.line];
            if (snk$1959.category && snk$1959.category.length > 1) {
                console.log(snk$1959.filename, snk$1959.line, snk$1959.category);
            }
        });
        cachedSourceSinkPaths$1754[appName$1948] = paths$1955;
        callback$1951(paths$1955);
    });
};
exports.getCallGraph = function (appName$1960, path$1961, callback$1962) {
    console.log('getCallGraph', appName$1960, path$1961);
    find$1705(path$1961, function (err$1964, files$1965) {
        if (!!err$1964) {
            throw err$1964;
        }
        var /* filter out android support lib files */
        appFiles$1967 = _$1704.filter(files$1965, function (f$1968) {
            return f$1968.indexOf('android/support') == -1;
        });
        processFiles$1743(appName$1960, appFiles$1967, null, callback$1962);
    });
};
