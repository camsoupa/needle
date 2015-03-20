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
        var className$1768 = a0$1766[0];
        var stmt$1769 = a0$1766[1];
        var ln$1770 = a0$1766[2];
        return {
            className: className$1768,
            filename: class2Filename$1706(className$1768),
            stmt: stmt$1769,
            line: ln$1770
        };
    }
    var x$1767 = a0$1766;
    console.log(x$1767);
    throw 'matchPathNode failed!';
    return;
}
function parseSourceSinkPaths$1716(str$1771) {
    var paths$1772 = parse$1697(str$1771);
    return _$1698.map(paths$1772, function (path$1774) {
        return _$1698.map(path$1774, matchPathNode$1712);
    });
}
function matchType$1720(a0$1775) {
    if ((Array.isArray ? Array.isArray(a0$1775) : Object.prototype.toString.call(a0$1775) === '[object Array]') && a0$1775.length === 2) {
        var r0$1777 = a0$1775[0];
        var r1$1778 = S$1703.unapply(r0$1777);
        if (r1$1778 != null && r1$1778.length === 1) {
            var r2$1779 = r1$1778[0];
            if (r2$1779 === 'array') {
                var type$1780 = a0$1775[1];
                return [matchType$1720(type$1780)];
            }
            if (r2$1779 === 'object') {
                var r3$1781 = a0$1775[1];
                var r4$1782 = S$1703.unapply(r3$1781);
                if (r4$1782 != null && r4$1782.length === 1) {
                    var className$1783 = r4$1782[0];
                    return className$1783.replace(/\//g, '.');
                }
            }
        }
    }
    var r5$1776 = S$1703.unapply(a0$1775);
    if (r5$1776 != null && r5$1776.length === 1) {
        var prim$1784 = r5$1776[0];
        return prim$1784;
    }
    throw new TypeError('No match');
}
function matchStmt$1724(a0$1785) {
    if (Array.isArray ? Array.isArray(a0$1785) : Object.prototype.toString.call(a0$1785) === '[object Array]') {
        if (a0$1785.length === 5) {
            var r0$1786 = a0$1785[0];
            var r1$1787 = S$1703.unapply(r0$1786);
            if (r1$1787 != null && r1$1787.length === 1) {
                var r2$1788 = a0$1785[2];
                var r3$1789 = S$1703.unapply(r2$1788);
                if (r3$1789 != null && (r3$1789.length === 1 && !r1$1787[0].indexOf('invoke'))) {
                    var type$1790 = r1$1787[0];
                    var regs$1791 = a0$1785[1];
                    var name$1792 = r3$1789[0];
                    var params$1793 = a0$1785[3];
                    var ret$1794 = a0$1785[4];
                    var invoke$1795 = {
                            type: type$1790,
                            name: name$1792.replace(/\//g, '.'),
                            params: _$1698.map(params$1793, matchType$1720),
                            ret: matchType$1720(ret$1794)
                        };
                    invoke$1795.signature = getMethodSigFromInvoke$1736(invoke$1795);
                    return invoke$1795;
                }
            }
        }
        if (a0$1785.length === 6) {
            var r4$1796 = a0$1785[0];
            var r5$1797 = S$1703.unapply(r4$1796);
            if (r5$1797 != null && r5$1797.length === 1) {
                var r6$1798 = a0$1785[2];
                if ((Array.isArray ? Array.isArray(r6$1798) : Object.prototype.toString.call(r6$1798) === '[object Array]') && r6$1798.length === 2) {
                    var r7$1799 = r6$1798[0];
                    var r8$1800 = S$1703.unapply(r7$1799);
                    if (r8$1800 != null && r8$1800.length === 1) {
                        var r9$1801 = r8$1800[0];
                        if (r9$1801 === 'array') {
                            var r10$1802 = a0$1785[3];
                            var r11$1803 = S$1703.unapply(r10$1802);
                            if (r11$1803 != null && r11$1803.length === 1) {
                                var type$1790 = r5$1797[0];
                                var regs$1791 = a0$1785[1];
                                var array_type$1804 = r6$1798[1];
                                var name$1792 = r11$1803[0];
                                var params$1793 = a0$1785[4];
                                var ret$1794 = a0$1785[5];
                                var invoke$1795 = {
                                        type: type$1790,
                                        name: matchType$1720(array_type$1804) + '[]' + name$1792.replace(/\//g, '.'),
                                        params: _$1698.map(params$1793, matchType$1720),
                                        ret: matchType$1720(ret$1794)
                                    };
                                invoke$1795.signature = getMethodSigFromInvoke$1736(invoke$1795);
                                return invoke$1795;
                            }
                        }
                    }
                }
            }
        }
        if (a0$1785.length === 2) {
            var r12$1805 = a0$1785[0];
            var r13$1806 = S$1703.unapply(r12$1805);
            if (r13$1806 != null && r13$1806.length === 1) {
                var r14$1807 = r13$1806[0];
                if (r14$1807 === 'line') {
                    var ln$1808 = a0$1785[1];
                    return ln$1808;
                }
            }
        }
    }
    return null;
}
function matchMethodDef$1728(a0$1809) {
    if ((Array.isArray ? Array.isArray(a0$1809) : Object.prototype.toString.call(a0$1809) === '[object Array]') && a0$1809.length >= 5) {
        var r0$1810 = a0$1809[0];
        var r1$1811 = S$1703.unapply(r0$1810);
        if (r1$1811 != null && r1$1811.length === 1) {
            var r2$1812 = r1$1811[0];
            if (r2$1812 === 'method') {
                var r3$1813 = a0$1809[1];
                if ((Array.isArray ? Array.isArray(r3$1813) : Object.prototype.toString.call(r3$1813) === '[object Array]') && r3$1813.length >= 1) {
                    var r4$1814 = r3$1813[0];
                    var r5$1815 = S$1703.unapply(r4$1814);
                    if (r5$1815 != null && r5$1815.length === 1) {
                        var r6$1816 = r5$1815[0];
                        if (r6$1816 === 'attrs') {
                            var r7$1817 = [];
                            var r8$1818 = 1;
                            for (var r9$1819 = 1, r10$1820 = r3$1813.length, r11$1821; r9$1819 < r10$1820; r9$1819++) {
                                r11$1821 = r3$1813[r9$1819];
                                r7$1817[r7$1817.length] = r11$1821;
                            }
                            if (r8$1818) {
                                var r12$1822 = a0$1809[2];
                                var r13$1823 = S$1703.unapply(r12$1822);
                                if (r13$1823 != null && r13$1823.length === 1) {
                                    var r14$1824 = [];
                                    var r15$1825 = 1;
                                    for (var r16$1826 = 5, r17$1827 = a0$1809.length, r18$1828; r16$1826 < r17$1827; r16$1826++) {
                                        r18$1828 = a0$1809[r16$1826];
                                        r14$1824[r14$1824.length] = r18$1828;
                                    }
                                    if (r15$1825) {
                                        var attrs$1829 = r7$1817;
                                        var name$1830 = r13$1823[0];
                                        var params$1831 = a0$1809[3];
                                        var ret$1832 = a0$1809[4];
                                        var body$1833 = r14$1824;
                                        var lines$1834 = [];
                                        var calls$1835 = [];
                                        var stmts$1836 = _$1698.chain(body$1833).map(matchStmt$1724).filter(NOT_NULL$1702).value();
                                        _$1698.forEach(stmts$1836, function (stmt$1838) {
                                            if (typeof stmt$1838 === 'number') {
                                                lines$1834.push(stmt$1838);
                                            } else {
                                                stmt$1838.line = _$1698.last(lines$1834);
                                                calls$1835.push(stmt$1838);
                                            }
                                        });
                                        return {
                                            type: 'method',
                                            name: name$1830,
                                            startLine: lines$1834[0],
                                            endLine: _$1698.last(lines$1834),
                                            attrs: _$1698.map(attrs$1829, S$1703.getSymbolName),
                                            params: _$1698.map(params$1831, matchType$1720),
                                            ret: matchType$1720(ret$1832),
                                            calls: calls$1835
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
function matchClass$1729(a0$1839) {
    if ((Array.isArray ? Array.isArray(a0$1839) : Object.prototype.toString.call(a0$1839) === '[object Array]') && a0$1839.length >= 5) {
        var r0$1840 = a0$1839[0];
        var r1$1841 = S$1703.unapply(r0$1840);
        if (r1$1841 != null && r1$1841.length === 1) {
            var r2$1842 = a0$1839[1];
            if ((Array.isArray ? Array.isArray(r2$1842) : Object.prototype.toString.call(r2$1842) === '[object Array]') && r2$1842.length >= 1) {
                var r3$1843 = r2$1842[0];
                var r4$1844 = S$1703.unapply(r3$1843);
                if (r4$1844 != null && r4$1844.length === 1) {
                    var r5$1845 = r4$1844[0];
                    if (r5$1845 === 'attrs') {
                        var r6$1846 = [];
                        var r7$1847 = 1;
                        for (var r8$1848 = 1, r9$1849 = r2$1842.length, r10$1850; r8$1848 < r9$1849; r8$1848++) {
                            r10$1850 = r2$1842[r8$1848];
                            r6$1846[r6$1846.length] = r10$1850;
                        }
                        if (r7$1847) {
                            var r11$1851 = a0$1839[2];
                            var r12$1852 = S$1703.unapply(r11$1851);
                            if (r12$1852 != null && r12$1852.length === 1) {
                                var r13$1853 = a0$1839[3];
                                if ((Array.isArray ? Array.isArray(r13$1853) : Object.prototype.toString.call(r13$1853) === '[object Array]') && r13$1853.length === 2) {
                                    var r14$1854 = r13$1853[0];
                                    var r15$1855 = S$1703.unapply(r14$1854);
                                    if (r15$1855 != null && r15$1855.length === 1) {
                                        var r16$1856 = r15$1855[0];
                                        if (r16$1856 === 'super') {
                                            var r17$1857 = r13$1853[1];
                                            var r18$1858 = S$1703.unapply(r17$1857);
                                            if (r18$1858 != null && r18$1858.length === 1) {
                                                var r19$1859 = a0$1839[4];
                                                if ((Array.isArray ? Array.isArray(r19$1859) : Object.prototype.toString.call(r19$1859) === '[object Array]') && r19$1859.length === 2) {
                                                    var r20$1860 = r19$1859[0];
                                                    var r21$1861 = S$1703.unapply(r20$1860);
                                                    if (r21$1861 != null && r21$1861.length === 1) {
                                                        var r22$1862 = r21$1861[0];
                                                        if (r22$1862 === 'source') {
                                                            var r23$1863 = [];
                                                            var r24$1864 = 1;
                                                            for (var r25$1865 = 5, r26$1866 = a0$1839.length, r27$1867; r25$1865 < r26$1866; r25$1865++) {
                                                                r27$1867 = a0$1839[r25$1865];
                                                                r23$1863[r23$1863.length] = r27$1867;
                                                            }
                                                            if (r24$1864 && (r1$1841[0] === 'class' || r1$1841[0] == 'interface')) {
                                                                var type$1868 = r1$1841[0];
                                                                var attrs$1869 = r6$1846;
                                                                var path$1870 = r12$1852[0];
                                                                var parent$1871 = r18$1858[0];
                                                                var file$1872 = r19$1859[1];
                                                                var members$1873 = r23$1863;
                                                                clazz = path$1870.replace(/\//g, '.');
                                                                parent$1871 = parent$1871.replace(/\//g, '.');
                                                                filename = path$1870.split('$')[0];
                                                                return {
                                                                    type: type$1868,
                                                                    file: filename,
                                                                    name: clazz,
                                                                    parent: parent$1871,
                                                                    attrs: _$1698.map(attrs$1869, S$1703.getSymbolName),
                                                                    methods: _$1698.chain(members$1873).map(matchMethodDef$1728).filter(NOT_NULL$1702).map(function (m$1875) {
                                                                        m$1875.clazz = clazz;
                                                                        m$1875.filename = filename;
                                                                        return m$1875;
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
var onFilesDone$1732 = function (appName$1876, classes$1877, onComplete$1878) {
    var methods$1879 = {};
    var outClasses$1880 = {};
    var files$1881 = {};
    _$1698.forEach(classes$1877, function (clazz$1888) {
        outClasses$1880[clazz$1888.name] = {
            type: clazz$1888.type,
            file: clazz$1888.file,
            name: clazz$1888.name,
            parent: clazz$1888.parent,
            attrs: clazz$1888.attrs,
            methods: [],
            subClasses: []
        };
        files$1881[clazz$1888.file] = {};
        _$1698.forEach(clazz$1888.methods, function (method$1890) {
            var sig$1891 = getMethodSig$1734(method$1890);
            methods$1879[sig$1891] = method$1890;
            methods$1879[sig$1891].file = clazz$1888.file;
            outClasses$1880[clazz$1888.name].methods.push(sig$1891);
        });
    });
    /* put all parent classes into the outClasses - TODO should we pull in the source code too for java.util, etc? */
    _$1698.forEach(_$1698.clone(outClasses$1880), function (clazz$1892) {
        if (clazz$1892.parent) {
            if (!(clazz$1892.parent in outClasses$1880)) {
                outClasses$1880[clazz$1892.parent] = {
                    name: clazz$1892.parent,
                    external: true,
                    methods: [],
                    subClasses: [clazz$1892.name]
                };
            } else {
                outClasses$1880[clazz$1892.parent].subClasses.push(clazz$1892.name);
            }
        } else {
            console.log('NO PARENT FOR: ' + clazz$1892.name);
        }
    });
    /* TODO consider if all indirectSubclasses is really what we want */
    function indirectSubclassesOf$1885(className$1893) {
        if (!className$1893 || !(className$1893 in outClasses$1880))
            return [];
        /* i.e. - no known subclasses */
        return _$1698.flatten(outClasses$1880[className$1893].subClasses.concat(_$1698.map(outClasses$1880[className$1893].subClasses, function (sub$1895) {
            return indirectSubclassesOf$1885(sub$1895);
        })));
    }
    /* including direct and indirect subClasses in calls for invoke-virtual and invoke-interface */
    _$1698.forEach(methods$1879, function (method$1896, methodSig$1897) {
        _$1698.forEach(method$1896.calls, function (invoke$1899) {
            if (invoke$1899.type == 'invoke-virtual' || invoke$1899.type == 'invoke-interface') {
                /* add known subTypes of the called class to the calls list */
                var parentClass$1900 = invoke$1899.name.split('.').slice(0, -1).join('.');
                var methodName$1901 = invoke$1899.name.split('.').pop();
                _$1698.forEach(indirectSubclassesOf$1885(parentClass$1900), function (subClass$1903) {
                    method$1896.calls.push({
                        type: invoke$1899.type,
                        name: [
                            subClass$1903,
                            methodName$1901
                        ].join('.'),
                        file: method$1896.file,
                        line: invoke$1899.line,
                        params: invoke$1899.params,
                        signature: invoke$1899.signature.replace(parentClass$1900, subClass$1903),
                        isInferred: true
                    });
                });
            }
        });
    });
    readSourcesAndSinks$1747(function (sources$1904, sinks$1905) {
        _$1698.forEach(methods$1879, function (m$1907, mSig$1908) {
            _$1698.forEach(m$1907.calls, function (invoke$1910) {
                if (invoke$1910.signature in sources$1904) {
                    if (!m$1907.risks)
                        m$1907.risks = [];
                    invoke$1910.isSource = true;
                    invoke$1910.category = sources$1904[invoke$1910.signature].category;
                    m$1907.risks.push(invoke$1910);
                    if (!(invoke$1910.line in files$1881[m$1907.file]))
                        files$1881[m$1907.file][invoke$1910.line] = [];
                    files$1881[m$1907.file][invoke$1910.line].push(invoke$1910.category);
                }
                if (invoke$1910.signature in sinks$1905) {
                    if (!m$1907.risks)
                        m$1907.risks = [];
                    invoke$1910.isSink = true;
                    invoke$1910.category = sinks$1905[invoke$1910.signature].category;
                    m$1907.risks.push(invoke$1910);
                    console.log(m$1907.file);
                    if (!(invoke$1910.line in files$1881[m$1907.file]))
                        files$1881[m$1907.file][invoke$1910.line] = [];
                    files$1881[m$1907.file][invoke$1910.line].push(invoke$1910.category);
                }
            });
        });
        appCache$1700[appName$1876] = {
            classes: outClasses$1880,
            methods: methods$1879,
            files: files$1881
        };
        onComplete$1878(appCache$1700[appName$1876]);
    });
};
function getMethodSig$1734(m$1911) {
    /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
    return [
        m$1911.clazz,
        m$1911.name
    ].join('.') + '(' + m$1911.params.join(',') + ') => ' + m$1911.ret;
}
function getMethodSigFromInvoke$1736(m$1912) {
    return m$1912.name + '(' + m$1912.params.join(',') + ') => ' + m$1912.ret;
}
function processFiles$1737(appName$1913, files$1914, classes$1915, cb$1916) {
    if (!classes$1915)
        classes$1915 = {};
    if (files$1914.length) {
        console.log(_$1698.last(files$1914));
        fs$1696.readFile(files$1914.pop(), { encoding: 'utf-8' }, function (err$1918, data$1919) {
            var clazz$1920 = matchClass$1729(parse$1697(data$1919));
            classes$1915[clazz$1920.name] = clazz$1920;
            processFiles$1737(appName$1913, files$1914, classes$1915, cb$1916);
        });
    } else {
        onFilesDone$1732(appName$1913, classes$1915, cb$1916);
    }
}
var NOT_EMPTY$1739 = function (m$1921) {
    return m$1921 != '';
};
function parseSourceSinkLine$1742(ln$1922) {
    var m$1923 = /\s*<([^:]*):\s(\S+)\s(\S+)\(([^)]*)\)>\s*((?:\S+\s+)*)\(([^)]+)\)\s*/.exec(ln$1922);
    if (m$1923) {
        m$1923 = m$1923.slice(1);
        // matched groups 
        return {
            clazz: m$1923[0],
            ret: m$1923[1],
            name: m$1923[2],
            params: _$1698.filter(m$1923[3].split(','), NOT_EMPTY$1739),
            permissions: m$1923[4].split(' '),
            category: m$1923[5].replace('NO_CATEGORY', 'GENERAL').replace('_INFORMATION', '').replace('SYNCHRONIZATION', 'SYNC')
        };
    } else {
        console.log('Ignoring source/sink line: ' + ln$1922);
    }
}
function parseSourceSinkList$1743(path$1924, onComplete$1925) {
    fs$1696.readFile(path$1924, { encoding: 'utf-8' }, function (err$1927, data$1928) {
        if (!!err$1927)
            throw err$1927;
        var lines$1929 = data$1928.split('\n');
        var parsed$1930 = _$1698.chain(lines$1929).map(parseSourceSinkLine$1742).filter(NOT_NULL$1702).value();
        onComplete$1925(parsed$1930);
    });
}
var cachedSources$1744;
var cachedSinks$1745;
function readSourcesAndSinks$1747(onComplete$1931) {
    if (!!cachedSources$1744 && !!cachedSinks$1745) {
        onComplete$1931(cachedSources$1744, cachedSinks$1745);
        return;
    }
    parseSourceSinkList$1743('data/sources_list', function (sources$1933) {
        parseSourceSinkList$1743('data/sinks_list', function (sinks$1935) {
            var outSources$1936 = {};
            var outSinks$1937 = {};
            _$1698.forEach(sources$1933, function (src$1940) {
                outSources$1936[getMethodSig$1734(src$1940)] = src$1940;
            });
            _$1698.forEach(sinks$1935, function (sink$1941) {
                outSinks$1937[getMethodSig$1734(sink$1941)] = sink$1941;
            });
            cachedSources$1744 = outSources$1936;
            cachedSinks$1745 = outSinks$1937;
            onComplete$1931(outSources$1936, outSinks$1937);
        });
    });
}
var cachedSourceSinkPaths$1748 = {};
exports.getSourceSinkPaths = function (appName$1942, path$1943, files$1944, callback$1945) {
    if (appName$1942 in cachedSourceSinkPaths$1748) {
        callback$1945(cachedSourceSinkPaths$1748[appName$1942]);
        return;
    }
    fs$1696.readFile(path$1943, { encoding: 'utf-8' }, function (err$1947, data$1948) {
        if (!!err$1947)
            throw err$1947;
        var paths$1949 = parseSourceSinkPaths$1716(data$1948);
        // TODO add categories sources and sinks here
        _$1698.forEach(paths$1949, function (path$1951) {
            var src$1952 = path$1951[0];
            var snk$1953 = path$1951[path$1951.length - 1];
            console.log(src$1952.filename);
            src$1952.category = files$1944[src$1952.filename][src$1952.line];
            if (src$1952.category && src$1952.category.length > 1) {
                console.log(src$1952.filename, src$1952.line, src$1952.category);
            }
            snk$1953.category = files$1944[snk$1953.filename][snk$1953.line];
            if (snk$1953.category && snk$1953.category.length > 1) {
                console.log(snk$1953.filename, snk$1953.line, snk$1953.category);
            }
        });
        cachedSourceSinkPaths$1748[appName$1942] = paths$1949;
        callback$1945(paths$1949);
    });
};
exports.getCallGraph = function (appName$1954, path$1955, callback$1956) {
    find$1699(path$1955, function (err$1958, files$1959) {
        if (!!err$1958)
            throw err$1958;
        /* filter out android support lib files */
        var appFiles$1961 = _$1698.filter(files$1959, function (f$1962) {
                return f$1962.indexOf('android/support') == -1;
            });
        processFiles$1737(appName$1954, appFiles$1961, null, callback$1956);
    });
};
