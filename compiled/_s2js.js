var fs$1696 = require('fs'), parse$1697 = require('sexpression').parse, _$1698 = require('lodash'), find$1699 = require('recursive-readdir');
/* avoid recalculation each time */
var appCache$1700 = {};
var NOT_NULL$1702 = function (m$1751) {
    return !!m$1751;
};
/* extracts a javascript encoded symbol for pattern matching */
var S$1703 = {
        getSymbolName: function (a0$1757) {
            if (a0$1757 != null) {
                var r0$1758 = Object(a0$1757);
                if (':' in r0$1758) {
                    var name$1759 = r0$1758[':'];
                    return name$1759;
                }
            }
            return null;
        },
        hasInstance: function (x$1760) {
            return !!S$1703.getSymbolName(x$1760);
        },
        unapply: function (x$1761) {
            var name$1762 = S$1703.getSymbolName(x$1761);
            if (name$1762) {
                return [name$1762];
            }
        }
    };
function class2Filename$1706(className$1763) {
    return className$1763.split('$')[0].replace(/\./g, '/');
}
function getPkg$1710(clazz$1764) {
    var parts$1765 = clazz$1764.split('.');
    parts$1765.pop();
    return parts$1765.join('.');
}
function matchPathNode$1712(a0$1766) {
    if ((Array.isArray ? Array.isArray(a0$1766) : Object.prototype.toString.call(a0$1766) === '[object Array]') && a0$1766.length === 3) {
        var className$1767 = a0$1766[0];
        var stmt$1768 = a0$1766[1];
        var ln$1769 = a0$1766[2];
        return {
            className: className$1767,
            filename: class2Filename$1706(className$1767),
            stmt: stmt$1768,
            line: ln$1769
        };
    }
    throw new TypeError('No match');
}
function parseSourceSinkPaths$1716(str$1770) {
    var paths$1771 = parse$1697(str$1770);
    return _$1698.map(paths$1771, function (path$1773) {
        return _$1698.map(path$1773, matchPathNode$1712);
    });
}
function matchType$1720(a0$1774) {
    if ((Array.isArray ? Array.isArray(a0$1774) : Object.prototype.toString.call(a0$1774) === '[object Array]') && a0$1774.length === 2) {
        var r0$1776 = a0$1774[0];
        var r1$1777 = S$1703.unapply(r0$1776);
        if (r1$1777 != null && r1$1777.length === 1) {
            var r2$1778 = r1$1777[0];
            if (r2$1778 === 'array') {
                var type$1779 = a0$1774[1];
                return [matchType$1720(type$1779)];
            }
            if (r2$1778 === 'object') {
                var r3$1780 = a0$1774[1];
                var r4$1781 = S$1703.unapply(r3$1780);
                if (r4$1781 != null && r4$1781.length === 1) {
                    var className$1782 = r4$1781[0];
                    return className$1782.replace(/\//g, '.');
                }
            }
        }
    }
    var r5$1775 = S$1703.unapply(a0$1774);
    if (r5$1775 != null && r5$1775.length === 1) {
        var prim$1783 = r5$1775[0];
        return prim$1783;
    }
    throw new TypeError('No match');
}
function matchStmt$1724(a0$1784) {
    if (Array.isArray ? Array.isArray(a0$1784) : Object.prototype.toString.call(a0$1784) === '[object Array]') {
        if (a0$1784.length === 5) {
            var r0$1785 = a0$1784[0];
            var r1$1786 = S$1703.unapply(r0$1785);
            if (r1$1786 != null && r1$1786.length === 1) {
                var r2$1787 = a0$1784[2];
                var r3$1788 = S$1703.unapply(r2$1787);
                if (r3$1788 != null && (r3$1788.length === 1 && !r1$1786[0].indexOf('invoke'))) {
                    var type$1789 = r1$1786[0];
                    var regs$1790 = a0$1784[1];
                    var name$1791 = r3$1788[0];
                    var params$1792 = a0$1784[3];
                    var ret$1793 = a0$1784[4];
                    var invoke$1794 = {
                            type: type$1789,
                            name: name$1791.replace(/\//g, '.'),
                            params: _$1698.map(params$1792, matchType$1720),
                            ret: matchType$1720(ret$1793)
                        };
                    invoke$1794.signature = getMethodSigFromInvoke$1736(invoke$1794);
                    return invoke$1794;
                }
            }
        }
        if (a0$1784.length === 6) {
            var r4$1795 = a0$1784[0];
            var r5$1796 = S$1703.unapply(r4$1795);
            if (r5$1796 != null && r5$1796.length === 1) {
                var r6$1797 = a0$1784[2];
                if ((Array.isArray ? Array.isArray(r6$1797) : Object.prototype.toString.call(r6$1797) === '[object Array]') && r6$1797.length === 2) {
                    var r7$1798 = r6$1797[0];
                    var r8$1799 = S$1703.unapply(r7$1798);
                    if (r8$1799 != null && r8$1799.length === 1) {
                        var r9$1800 = r8$1799[0];
                        if (r9$1800 === 'array') {
                            var r10$1801 = a0$1784[3];
                            var r11$1802 = S$1703.unapply(r10$1801);
                            if (r11$1802 != null && r11$1802.length === 1) {
                                var type$1789 = r5$1796[0];
                                var regs$1790 = a0$1784[1];
                                var array_type$1803 = r6$1797[1];
                                var name$1791 = r11$1802[0];
                                var params$1792 = a0$1784[4];
                                var ret$1793 = a0$1784[5];
                                var invoke$1794 = {
                                        type: type$1789,
                                        name: matchType$1720(array_type$1803) + '[]' + name$1791.replace(/\//g, '.'),
                                        params: _$1698.map(params$1792, matchType$1720),
                                        ret: matchType$1720(ret$1793)
                                    };
                                invoke$1794.signature = getMethodSigFromInvoke$1736(invoke$1794);
                                return invoke$1794;
                            }
                        }
                    }
                }
            }
        }
        if (a0$1784.length === 2) {
            var r12$1804 = a0$1784[0];
            var r13$1805 = S$1703.unapply(r12$1804);
            if (r13$1805 != null && r13$1805.length === 1) {
                var r14$1806 = r13$1805[0];
                if (r14$1806 === 'line') {
                    var ln$1807 = a0$1784[1];
                    return ln$1807;
                }
            }
        }
    }
    return null;
}
function matchMethodDef$1728(a0$1808) {
    if ((Array.isArray ? Array.isArray(a0$1808) : Object.prototype.toString.call(a0$1808) === '[object Array]') && a0$1808.length >= 5) {
        var r0$1809 = a0$1808[0];
        var r1$1810 = S$1703.unapply(r0$1809);
        if (r1$1810 != null && r1$1810.length === 1) {
            var r2$1811 = r1$1810[0];
            if (r2$1811 === 'method') {
                var r3$1812 = a0$1808[1];
                if ((Array.isArray ? Array.isArray(r3$1812) : Object.prototype.toString.call(r3$1812) === '[object Array]') && r3$1812.length >= 1) {
                    var r4$1813 = r3$1812[0];
                    var r5$1814 = S$1703.unapply(r4$1813);
                    if (r5$1814 != null && r5$1814.length === 1) {
                        var r6$1815 = r5$1814[0];
                        if (r6$1815 === 'attrs') {
                            var r7$1816 = [];
                            var r8$1817 = 1;
                            for (var r9$1818 = 1, r10$1819 = r3$1812.length, r11$1820; r9$1818 < r10$1819; r9$1818++) {
                                r11$1820 = r3$1812[r9$1818];
                                r7$1816[r7$1816.length] = r11$1820;
                            }
                            if (r8$1817) {
                                var r12$1821 = a0$1808[2];
                                var r13$1822 = S$1703.unapply(r12$1821);
                                if (r13$1822 != null && r13$1822.length === 1) {
                                    var r14$1823 = [];
                                    var r15$1824 = 1;
                                    for (var r16$1825 = 5, r17$1826 = a0$1808.length, r18$1827; r16$1825 < r17$1826; r16$1825++) {
                                        r18$1827 = a0$1808[r16$1825];
                                        r14$1823[r14$1823.length] = r18$1827;
                                    }
                                    if (r15$1824) {
                                        var attrs$1828 = r7$1816;
                                        var name$1829 = r13$1822[0];
                                        var params$1830 = a0$1808[3];
                                        var ret$1831 = a0$1808[4];
                                        var body$1832 = r14$1823;
                                        var lines$1833 = [];
                                        var calls$1834 = [];
                                        var stmts$1835 = _$1698.chain(body$1832).map(matchStmt$1724).filter(NOT_NULL$1702).value();
                                        _$1698.forEach(stmts$1835, function (stmt$1837) {
                                            if (typeof stmt$1837 === 'number') {
                                                lines$1833.push(stmt$1837);
                                            } else {
                                                stmt$1837.line = _$1698.last(lines$1833);
                                                calls$1834.push(stmt$1837);
                                            }
                                        });
                                        return {
                                            type: 'method',
                                            name: name$1829,
                                            startLine: lines$1833[0],
                                            endLine: _$1698.last(lines$1833),
                                            attrs: _$1698.map(attrs$1828, S$1703.getSymbolName),
                                            params: _$1698.map(params$1830, matchType$1720),
                                            ret: matchType$1720(ret$1831),
                                            calls: calls$1834
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
function matchClass$1729(a0$1838) {
    if ((Array.isArray ? Array.isArray(a0$1838) : Object.prototype.toString.call(a0$1838) === '[object Array]') && a0$1838.length >= 5) {
        var r0$1839 = a0$1838[0];
        var r1$1840 = S$1703.unapply(r0$1839);
        if (r1$1840 != null && r1$1840.length === 1) {
            var r2$1841 = a0$1838[1];
            if ((Array.isArray ? Array.isArray(r2$1841) : Object.prototype.toString.call(r2$1841) === '[object Array]') && r2$1841.length >= 1) {
                var r3$1842 = r2$1841[0];
                var r4$1843 = S$1703.unapply(r3$1842);
                if (r4$1843 != null && r4$1843.length === 1) {
                    var r5$1844 = r4$1843[0];
                    if (r5$1844 === 'attrs') {
                        var r6$1845 = [];
                        var r7$1846 = 1;
                        for (var r8$1847 = 1, r9$1848 = r2$1841.length, r10$1849; r8$1847 < r9$1848; r8$1847++) {
                            r10$1849 = r2$1841[r8$1847];
                            r6$1845[r6$1845.length] = r10$1849;
                        }
                        if (r7$1846) {
                            var r11$1850 = a0$1838[2];
                            var r12$1851 = S$1703.unapply(r11$1850);
                            if (r12$1851 != null && r12$1851.length === 1) {
                                var r13$1852 = a0$1838[3];
                                if ((Array.isArray ? Array.isArray(r13$1852) : Object.prototype.toString.call(r13$1852) === '[object Array]') && r13$1852.length === 2) {
                                    var r14$1853 = r13$1852[0];
                                    var r15$1854 = S$1703.unapply(r14$1853);
                                    if (r15$1854 != null && r15$1854.length === 1) {
                                        var r16$1855 = r15$1854[0];
                                        if (r16$1855 === 'super') {
                                            var r17$1856 = r13$1852[1];
                                            var r18$1857 = S$1703.unapply(r17$1856);
                                            if (r18$1857 != null && r18$1857.length === 1) {
                                                var r19$1858 = a0$1838[4];
                                                if ((Array.isArray ? Array.isArray(r19$1858) : Object.prototype.toString.call(r19$1858) === '[object Array]') && r19$1858.length === 2) {
                                                    var r20$1859 = r19$1858[0];
                                                    var r21$1860 = S$1703.unapply(r20$1859);
                                                    if (r21$1860 != null && r21$1860.length === 1) {
                                                        var r22$1861 = r21$1860[0];
                                                        if (r22$1861 === 'source') {
                                                            var r23$1862 = [];
                                                            var r24$1863 = 1;
                                                            for (var r25$1864 = 5, r26$1865 = a0$1838.length, r27$1866; r25$1864 < r26$1865; r25$1864++) {
                                                                r27$1866 = a0$1838[r25$1864];
                                                                r23$1862[r23$1862.length] = r27$1866;
                                                            }
                                                            if (r24$1863 && (r1$1840[0] === 'class' || r1$1840[0] == 'interface')) {
                                                                var type$1867 = r1$1840[0];
                                                                var attrs$1868 = r6$1845;
                                                                var path$1869 = r12$1851[0];
                                                                var parent$1870 = r18$1857[0];
                                                                var file$1871 = r19$1858[1];
                                                                var members$1872 = r23$1862;
                                                                clazz = path$1869.replace(/\//g, '.');
                                                                parent$1870 = parent$1870.replace(/\//g, '.');
                                                                filename = path$1869.split('$')[0];
                                                                return {
                                                                    type: type$1867,
                                                                    file: filename,
                                                                    name: clazz,
                                                                    parent: parent$1870,
                                                                    attrs: _$1698.map(attrs$1868, S$1703.getSymbolName),
                                                                    methods: _$1698.chain(members$1872).map(matchMethodDef$1728).filter(NOT_NULL$1702).map(function (m$1874) {
                                                                        m$1874.clazz = clazz;
                                                                        m$1874.filename = filename;
                                                                        return m$1874;
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
var onFilesDone$1732 = function (appName$1875, classes$1876, onComplete$1877) {
    var methods$1878 = {};
    var outClasses$1879 = {};
    var files$1880 = {};
    _$1698.forEach(classes$1876, function (clazz$1887) {
        outClasses$1879[clazz$1887.name] = {
            type: clazz$1887.type,
            file: clazz$1887.file,
            name: clazz$1887.name,
            parent: clazz$1887.parent,
            attrs: clazz$1887.attrs,
            methods: [],
            subClasses: []
        };
        files$1880[clazz$1887.file] = {};
        _$1698.forEach(clazz$1887.methods, function (method$1889) {
            var sig$1890 = getMethodSig$1734(method$1889);
            methods$1878[sig$1890] = method$1889;
            methods$1878[sig$1890].file = clazz$1887.file;
            outClasses$1879[clazz$1887.name].methods.push(sig$1890);
        });
    });
    /* put all parent classes into the outClasses - TODO should we pull in the source code too for java.util, etc? */
    _$1698.forEach(_$1698.clone(outClasses$1879), function (clazz$1891) {
        if (clazz$1891.parent) {
            if (!(clazz$1891.parent in outClasses$1879)) {
                outClasses$1879[clazz$1891.parent] = {
                    name: clazz$1891.parent,
                    external: true,
                    methods: [],
                    subClasses: [clazz$1891.name]
                };
            } else {
                outClasses$1879[clazz$1891.parent].subClasses.push(clazz$1891.name);
            }
        } else {
            console.log('NO PARENT FOR: ' + clazz$1891.name);
        }
    });
    /* TODO consider if all indirectSubclasses is really what we want */
    function indirectSubclassesOf$1884(className$1892) {
        if (!className$1892 || !(className$1892 in outClasses$1879))
            return [];
        /* i.e. - no known subclasses */
        return _$1698.flatten(outClasses$1879[className$1892].subClasses.concat(_$1698.map(outClasses$1879[className$1892].subClasses, function (sub$1894) {
            return indirectSubclassesOf$1884(sub$1894);
        })));
    }
    /* including direct and indirect subClasses in calls for invoke-virtual and invoke-interface */
    _$1698.forEach(methods$1878, function (method$1895, methodSig$1896) {
        _$1698.forEach(method$1895.calls, function (invoke$1898) {
            if (invoke$1898.type == 'invoke-virtual' || invoke$1898.type == 'invoke-interface') {
                /* add known subTypes of the called class to the calls list */
                var parentClass$1899 = invoke$1898.name.split('.').slice(0, -1).join('.');
                var methodName$1900 = invoke$1898.name.split('.').pop();
                _$1698.forEach(indirectSubclassesOf$1884(parentClass$1899), function (subClass$1902) {
                    method$1895.calls.push({
                        type: invoke$1898.type,
                        name: [
                            subClass$1902,
                            methodName$1900
                        ].join('.'),
                        file: method$1895.file,
                        line: invoke$1898.line,
                        params: invoke$1898.params,
                        signature: invoke$1898.signature.replace(parentClass$1899, subClass$1902),
                        isInferred: true
                    });
                });
            }
        });
    });
    readSourcesAndSinks$1747(function (sources$1903, sinks$1904) {
        _$1698.forEach(methods$1878, function (m$1906, mSig$1907) {
            _$1698.forEach(m$1906.calls, function (invoke$1909) {
                if (invoke$1909.signature in sources$1903) {
                    if (!m$1906.risks)
                        m$1906.risks = [];
                    invoke$1909.isSource = true;
                    invoke$1909.category = sources$1903[invoke$1909.signature].category;
                    m$1906.risks.push(invoke$1909);
                    if (!(invoke$1909.line in files$1880[m$1906.file]))
                        files$1880[m$1906.file][invoke$1909.line] = [];
                    files$1880[m$1906.file][invoke$1909.line].push(invoke$1909);
                }
                if (invoke$1909.signature in sinks$1904) {
                    if (!m$1906.risks)
                        m$1906.risks = [];
                    invoke$1909.isSink = true;
                    invoke$1909.category = sinks$1904[invoke$1909.signature].category;
                    m$1906.risks.push(invoke$1909);
                    console.log(m$1906.file);
                    if (!(invoke$1909.line in files$1880[m$1906.file]))
                        files$1880[m$1906.file][invoke$1909.line] = [];
                    files$1880[m$1906.file][invoke$1909.line].push(invoke$1909);
                }
            });
        });
        appCache$1700[appName$1875] = {
            classes: outClasses$1879,
            methods: methods$1878,
            files: files$1880
        };
        onComplete$1877(appCache$1700[appName$1875]);
    });
};
function getMethodSig$1734(m$1910) {
    /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
    return [
        m$1910.clazz,
        m$1910.name
    ].join('.') + '(' + m$1910.params.join(',') + ') => ' + m$1910.ret;
}
function getMethodSigFromInvoke$1736(m$1911) {
    return m$1911.name + '(' + m$1911.params.join(',') + ') => ' + m$1911.ret;
}
function processFiles$1737(appName$1912, files$1913, classes$1914, cb$1915) {
    if (!classes$1914)
        classes$1914 = {};
    if (files$1913.length) {
        console.log(_$1698.last(files$1913));
        fs$1696.readFile(files$1913.pop(), { encoding: 'utf-8' }, function (err$1917, data$1918) {
            var clazz$1919 = matchClass$1729(parse$1697(data$1918));
            classes$1914[clazz$1919.name] = clazz$1919;
            processFiles$1737(appName$1912, files$1913, classes$1914, cb$1915);
        });
    } else {
        onFilesDone$1732(appName$1912, classes$1914, cb$1915);
    }
}
var NOT_EMPTY$1739 = function (m$1920) {
    return m$1920 != '';
};
function parseSourceSinkLine$1742(ln$1921) {
    var m$1922 = /\s*<([^:]*):\s(\S+)\s(\S+)\(([^)]*)\)>\s*((?:\S+\s+)*)\(([^)]+)\)\s*/.exec(ln$1921);
    if (m$1922) {
        m$1922 = m$1922.slice(1);
        // matched groups 
        return {
            clazz: m$1922[0],
            ret: m$1922[1],
            name: m$1922[2],
            params: _$1698.filter(m$1922[3].split(','), NOT_EMPTY$1739),
            permissions: m$1922[4].split(' '),
            category: m$1922[5].replace('NO_CATEGORY', 'GENERAL').replace('_INFORMATION', '').replace('SYNCHRONIZATION', 'SYNC')
        };
    } else {
        console.log('Ignoring source/sink line: ' + ln$1921);
    }
}
function parseSourceSinkList$1743(path$1923, onComplete$1924) {
    fs$1696.readFile(path$1923, { encoding: 'utf-8' }, function (err$1926, data$1927) {
        if (!!err$1926)
            throw err$1926;
        var lines$1928 = data$1927.split('\n');
        var parsed$1929 = _$1698.chain(lines$1928).map(parseSourceSinkLine$1742).filter(NOT_NULL$1702).value();
        onComplete$1924(parsed$1929);
    });
}
var cachedSources$1744;
var cachedSinks$1745;
function readSourcesAndSinks$1747(onComplete$1930) {
    if (!!cachedSources$1744 && !!cachedSinks$1745) {
        onComplete$1930(cachedSources$1744, cachedSinks$1745);
        return;
    }
    parseSourceSinkList$1743('data/sources_list', function (sources$1932) {
        parseSourceSinkList$1743('data/sinks_list', function (sinks$1934) {
            var outSources$1935 = {};
            var outSinks$1936 = {};
            _$1698.forEach(sources$1932, function (src$1939) {
                outSources$1935[getMethodSig$1734(src$1939)] = src$1939;
            });
            _$1698.forEach(sinks$1934, function (sink$1940) {
                outSinks$1936[getMethodSig$1734(sink$1940)] = sink$1940;
            });
            cachedSources$1744 = outSources$1935;
            cachedSinks$1745 = outSinks$1936;
            onComplete$1930(outSources$1935, outSinks$1936);
        });
    });
}
var cachedSourceSinkPaths$1748 = {};
exports.getSourceSinkPaths = function (appName$1941, path$1942, files$1943, callback$1944) {
    if (appName$1941 in cachedSourceSinkPaths$1748) {
        callback$1944(cachedSourceSinkPaths$1748[appName$1941]);
        return;
    }
    fs$1696.readFile(path$1942, { encoding: 'utf-8' }, function (err$1946, data$1947) {
        if (!!err$1946)
            throw err$1946;
        var paths$1948 = parseSourceSinkPaths$1716(data$1947);
        // TODO add categories sources and sinks here
        _$1698.forEach(paths$1948, function (path$1950) {
            var src$1951 = path$1950[0];
            var snk$1952 = path$1950[path$1950.length - 1];
            console.log(src$1951.filename);
            src$1951.category = files$1943[src$1951.filename][src$1951.line];
            snk$1952.category = files$1943[snk$1952.filename][snk$1952.line];
        });
        cachedSourceSinkPaths$1748[appName$1941] = paths$1948;
        callback$1944(paths$1948);
    });
};
exports.getCallGraph = function (appName$1953, path$1954, callback$1955) {
    find$1699(path$1954, function (err$1957, files$1958) {
        if (!!err$1957)
            throw err$1957;
        /* filter out android support lib files */
        var appFiles$1960 = _$1698.filter(files$1958, function (f$1961) {
                return f$1961.indexOf('android/support') == -1;
            });
        processFiles$1737(appName$1953, appFiles$1960, null, callback$1955);
    });
};
