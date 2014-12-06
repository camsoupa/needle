var fs$1696 = require('fs'), parse$1697 = require('sexpression').parse, _$1698 = require('lodash'), find$1699 = require('recursive-readdir');
var NOT_NULL$1701 = function (m$1745) {
    return !!m$1745;
};
/* extracts a javascript encoded symbol for pattern matching */
var S$1702 = {
        getSymbolName: function (a0$1751) {
            if (a0$1751 != null) {
                var r0$1752 = Object(a0$1751);
                if (':' in r0$1752) {
                    var name$1753 = r0$1752[':'];
                    return name$1753;
                }
            }
            return null;
        },
        hasInstance: function (x$1754) {
            return !!S$1702.getSymbolName(x$1754);
        },
        unapply: function (x$1755) {
            var name$1756 = S$1702.getSymbolName(x$1755);
            if (name$1756) {
                return [name$1756];
            }
        }
    };
function class2Filename$1707(className$1757) {
    return className$1757.split('$')[0].replace(/\./g, '/') + '.java';
}
function matchPathNode$1709(a0$1758) {
    if ((Array.isArray ? Array.isArray(a0$1758) : Object.prototype.toString.call(a0$1758) === '[object Array]') && a0$1758.length === 3) {
        var className$1759 = a0$1758[0];
        var stmt$1760 = a0$1758[1];
        var ln$1761 = a0$1758[2];
        return {
            className: className$1759,
            filename: class2Filename$1707(className$1759),
            stmt: stmt$1760,
            line: ln$1761
        };
    }
    throw new TypeError('No match');
}
function parseSourceSinkPaths$1713(str$1762) {
    var paths$1763 = parse$1697(str$1762);
    return _$1698.map(paths$1763, function (path$1765) {
        return _$1698.map(path$1765, matchPathNode$1709);
    });
}
function matchType$1717(a0$1766) {
    if ((Array.isArray ? Array.isArray(a0$1766) : Object.prototype.toString.call(a0$1766) === '[object Array]') && a0$1766.length === 2) {
        var r0$1768 = a0$1766[0];
        var r1$1769 = S$1702.unapply(r0$1768);
        if (r1$1769 != null && r1$1769.length === 1) {
            var r2$1770 = r1$1769[0];
            if (r2$1770 === 'array') {
                var type$1771 = a0$1766[1];
                return [matchType$1717(type$1771)];
            }
            if (r2$1770 === 'object') {
                var r3$1772 = a0$1766[1];
                var r4$1773 = S$1702.unapply(r3$1772);
                if (r4$1773 != null && r4$1773.length === 1) {
                    var className$1774 = r4$1773[0];
                    return className$1774.replace(/\//g, '.');
                }
            }
        }
    }
    var r5$1767 = S$1702.unapply(a0$1766);
    if (r5$1767 != null && r5$1767.length === 1) {
        var prim$1775 = r5$1767[0];
        return prim$1775;
    }
    throw new TypeError('No match');
}
function matchStmt$1721(a0$1776) {
    if (Array.isArray ? Array.isArray(a0$1776) : Object.prototype.toString.call(a0$1776) === '[object Array]') {
        if (a0$1776.length === 5) {
            var r0$1777 = a0$1776[0];
            var r1$1778 = S$1702.unapply(r0$1777);
            if (r1$1778 != null && r1$1778.length === 1) {
                var r2$1779 = a0$1776[2];
                var r3$1780 = S$1702.unapply(r2$1779);
                if (r3$1780 != null && (r3$1780.length === 1 && !r1$1778[0].indexOf('invoke'))) {
                    var type$1781 = r1$1778[0];
                    var regs$1782 = a0$1776[1];
                    var name$1783 = r3$1780[0];
                    var params$1784 = a0$1776[3];
                    var ret$1785 = a0$1776[4];
                    var invoke$1786 = {
                            type: type$1781,
                            name: name$1783.replace(/\//g, '.'),
                            params: _$1698.map(params$1784, matchType$1717),
                            ret: matchType$1717(ret$1785)
                        };
                    invoke$1786.signature = getMethodSigFromInvoke$1733(invoke$1786);
                    return invoke$1786;
                }
            }
        }
        if (a0$1776.length === 6) {
            var r4$1787 = a0$1776[0];
            var r5$1788 = S$1702.unapply(r4$1787);
            if (r5$1788 != null && r5$1788.length === 1) {
                var r6$1789 = a0$1776[2];
                if ((Array.isArray ? Array.isArray(r6$1789) : Object.prototype.toString.call(r6$1789) === '[object Array]') && r6$1789.length === 2) {
                    var r7$1790 = r6$1789[0];
                    var r8$1791 = S$1702.unapply(r7$1790);
                    if (r8$1791 != null && r8$1791.length === 1) {
                        var r9$1792 = r8$1791[0];
                        if (r9$1792 === 'array') {
                            var r10$1793 = a0$1776[3];
                            var r11$1794 = S$1702.unapply(r10$1793);
                            if (r11$1794 != null && r11$1794.length === 1) {
                                var type$1781 = r5$1788[0];
                                var regs$1782 = a0$1776[1];
                                var array_type$1795 = r6$1789[1];
                                var name$1783 = r11$1794[0];
                                var params$1784 = a0$1776[4];
                                var ret$1785 = a0$1776[5];
                                var invoke$1786 = {
                                        type: type$1781,
                                        name: matchType$1717(array_type$1795) + '[]' + name$1783.replace(/\//g, '.'),
                                        params: _$1698.map(params$1784, matchType$1717),
                                        ret: matchType$1717(ret$1785)
                                    };
                                invoke$1786.signature = getMethodSigFromInvoke$1733(invoke$1786);
                                return invoke$1786;
                            }
                        }
                    }
                }
            }
        }
        if (a0$1776.length === 2) {
            var r12$1796 = a0$1776[0];
            var r13$1797 = S$1702.unapply(r12$1796);
            if (r13$1797 != null && r13$1797.length === 1) {
                var r14$1798 = r13$1797[0];
                if (r14$1798 === 'line') {
                    var ln$1799 = a0$1776[1];
                    return ln$1799;
                }
            }
        }
    }
    return null;
}
function matchMethodDef$1725(a0$1800) {
    if ((Array.isArray ? Array.isArray(a0$1800) : Object.prototype.toString.call(a0$1800) === '[object Array]') && a0$1800.length >= 5) {
        var r0$1801 = a0$1800[0];
        var r1$1802 = S$1702.unapply(r0$1801);
        if (r1$1802 != null && r1$1802.length === 1) {
            var r2$1803 = r1$1802[0];
            if (r2$1803 === 'method') {
                var r3$1804 = a0$1800[1];
                if ((Array.isArray ? Array.isArray(r3$1804) : Object.prototype.toString.call(r3$1804) === '[object Array]') && r3$1804.length >= 1) {
                    var r4$1805 = r3$1804[0];
                    var r5$1806 = S$1702.unapply(r4$1805);
                    if (r5$1806 != null && r5$1806.length === 1) {
                        var r6$1807 = r5$1806[0];
                        if (r6$1807 === 'attrs') {
                            var r7$1808 = [];
                            var r8$1809 = 1;
                            for (var r9$1810 = 1, r10$1811 = r3$1804.length, r11$1812; r9$1810 < r10$1811; r9$1810++) {
                                r11$1812 = r3$1804[r9$1810];
                                r7$1808[r7$1808.length] = r11$1812;
                            }
                            if (r8$1809) {
                                var r12$1813 = a0$1800[2];
                                var r13$1814 = S$1702.unapply(r12$1813);
                                if (r13$1814 != null && r13$1814.length === 1) {
                                    var r14$1815 = [];
                                    var r15$1816 = 1;
                                    for (var r16$1817 = 5, r17$1818 = a0$1800.length, r18$1819; r16$1817 < r17$1818; r16$1817++) {
                                        r18$1819 = a0$1800[r16$1817];
                                        r14$1815[r14$1815.length] = r18$1819;
                                    }
                                    if (r15$1816) {
                                        var attrs$1820 = r7$1808;
                                        var name$1821 = r13$1814[0];
                                        var params$1822 = a0$1800[3];
                                        var ret$1823 = a0$1800[4];
                                        var body$1824 = r14$1815;
                                        var lines$1825 = [];
                                        var calls$1826 = [];
                                        var stmts$1827 = _$1698.chain(body$1824).map(matchStmt$1721).filter(NOT_NULL$1701).value();
                                        _$1698.forEach(stmts$1827, function (stmt$1829) {
                                            if (typeof stmt$1829 === 'number') {
                                                lines$1825.push(stmt$1829);
                                            } else {
                                                stmt$1829.line = _$1698.last(lines$1825);
                                                calls$1826.push(stmt$1829);
                                            }
                                        });
                                        return {
                                            type: 'method',
                                            name: name$1821,
                                            startLine: lines$1825[0],
                                            endLine: _$1698.last(lines$1825),
                                            attrs: _$1698.map(attrs$1820, S$1702.getSymbolName),
                                            params: _$1698.map(params$1822, matchType$1717),
                                            ret: matchType$1717(ret$1823),
                                            calls: calls$1826
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
function matchClass$1726(a0$1830) {
    if ((Array.isArray ? Array.isArray(a0$1830) : Object.prototype.toString.call(a0$1830) === '[object Array]') && a0$1830.length >= 5) {
        var r0$1831 = a0$1830[0];
        var r1$1832 = S$1702.unapply(r0$1831);
        if (r1$1832 != null && r1$1832.length === 1) {
            var r2$1833 = a0$1830[1];
            if ((Array.isArray ? Array.isArray(r2$1833) : Object.prototype.toString.call(r2$1833) === '[object Array]') && r2$1833.length >= 1) {
                var r3$1834 = r2$1833[0];
                var r4$1835 = S$1702.unapply(r3$1834);
                if (r4$1835 != null && r4$1835.length === 1) {
                    var r5$1836 = r4$1835[0];
                    if (r5$1836 === 'attrs') {
                        var r6$1837 = [];
                        var r7$1838 = 1;
                        for (var r8$1839 = 1, r9$1840 = r2$1833.length, r10$1841; r8$1839 < r9$1840; r8$1839++) {
                            r10$1841 = r2$1833[r8$1839];
                            r6$1837[r6$1837.length] = r10$1841;
                        }
                        if (r7$1838) {
                            var r11$1842 = a0$1830[2];
                            var r12$1843 = S$1702.unapply(r11$1842);
                            if (r12$1843 != null && r12$1843.length === 1) {
                                var r13$1844 = a0$1830[3];
                                if ((Array.isArray ? Array.isArray(r13$1844) : Object.prototype.toString.call(r13$1844) === '[object Array]') && r13$1844.length === 2) {
                                    var r14$1845 = r13$1844[0];
                                    var r15$1846 = S$1702.unapply(r14$1845);
                                    if (r15$1846 != null && r15$1846.length === 1) {
                                        var r16$1847 = r15$1846[0];
                                        if (r16$1847 === 'super') {
                                            var r17$1848 = r13$1844[1];
                                            var r18$1849 = S$1702.unapply(r17$1848);
                                            if (r18$1849 != null && r18$1849.length === 1) {
                                                var r19$1850 = a0$1830[4];
                                                if ((Array.isArray ? Array.isArray(r19$1850) : Object.prototype.toString.call(r19$1850) === '[object Array]') && r19$1850.length === 2) {
                                                    var r20$1851 = r19$1850[0];
                                                    var r21$1852 = S$1702.unapply(r20$1851);
                                                    if (r21$1852 != null && r21$1852.length === 1) {
                                                        var r22$1853 = r21$1852[0];
                                                        if (r22$1853 === 'source') {
                                                            var r23$1854 = [];
                                                            var r24$1855 = 1;
                                                            for (var r25$1856 = 5, r26$1857 = a0$1830.length, r27$1858; r25$1856 < r26$1857; r25$1856++) {
                                                                r27$1858 = a0$1830[r25$1856];
                                                                r23$1854[r23$1854.length] = r27$1858;
                                                            }
                                                            if (r24$1855 && (r1$1832[0] === 'class' || r1$1832[0] == 'interface')) {
                                                                var type$1859 = r1$1832[0];
                                                                var attrs$1860 = r6$1837;
                                                                var clazz$1861 = r12$1843[0];
                                                                var parent$1862 = r18$1849[0];
                                                                var file$1863 = r19$1850[1];
                                                                var members$1864 = r23$1854;
                                                                clazz$1861 = clazz$1861.replace(/\//g, '.');
                                                                parent$1862 = parent$1862.replace(/\//g, '.');
                                                                return {
                                                                    type: type$1859,
                                                                    file: file$1863,
                                                                    name: clazz$1861,
                                                                    parent: parent$1862,
                                                                    attrs: _$1698.map(attrs$1860, S$1702.getSymbolName),
                                                                    methods: _$1698.chain(members$1864).map(matchMethodDef$1725).filter(NOT_NULL$1701).map(function (m$1866) {
                                                                        m$1866.clazz = clazz$1861;
                                                                        m$1866.file = file$1863;
                                                                        return m$1866;
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
var onFilesDone$1729 = function (classes$1867, onComplete$1868) {
    var methods$1869 = {};
    var outClasses$1870 = {};
    _$1698.forEach(classes$1867, function (clazz$1877) {
        outClasses$1870[clazz$1877.name] = {
            type: clazz$1877.type,
            file: clazz$1877.file,
            name: clazz$1877.name,
            parent: clazz$1877.parent,
            attrs: clazz$1877.attrs,
            methods: [],
            subClasses: []
        };
        _$1698.forEach(clazz$1877.methods, function (method$1879) {
            var sig$1880 = getMethodSig$1731(method$1879);
            methods$1869[sig$1880] = method$1879;
            outClasses$1870[clazz$1877.name].methods.push(sig$1880);
        });
    });
    /* put all parent classes into the outClasses - TODO should we pull in the source code too for java.util, etc? */
    _$1698.forEach(_$1698.clone(outClasses$1870), function (clazz$1881) {
        if (clazz$1881.parent) {
            if (!(clazz$1881.parent in outClasses$1870)) {
                outClasses$1870[clazz$1881.parent] = {
                    name: clazz$1881.parent,
                    external: true,
                    methods: [],
                    subClasses: [clazz$1881.name]
                };
            } else {
                outClasses$1870[clazz$1881.parent].subClasses.push(clazz$1881.name);
            }
        } else {
            console.log('NO PARENT FOR: ' + clazz$1881.name);
        }
    });
    /* TODO consider if all indirectSubclasses is really what we want */
    function indirectSubclassesOf$1874(className$1882) {
        if (!className$1882 || !(className$1882 in outClasses$1870))
            return [];
        /* i.e. - no known subclasses */
        return _$1698.flatten(outClasses$1870[className$1882].subClasses.concat(_$1698.map(outClasses$1870[className$1882].subClasses, function (sub$1884) {
            return indirectSubclassesOf$1874(sub$1884);
        })));
    }
    /* including direct and indirect subClasses in calls for invoke-virtual and invoke-interface */
    _$1698.forEach(methods$1869, function (method$1885, methodSig$1886) {
        _$1698.forEach(method$1885.calls, function (invoke$1888) {
            if (invoke$1888.type == 'invoke-virtual' || invoke$1888.type == 'invoke-interface') {
                /* add known subTypes of the called class to the calls list */
                var parentClass$1889 = invoke$1888.name.split('.').slice(0, -1).join('.');
                var methodName$1890 = invoke$1888.name.split('.').pop();
                _$1698.forEach(indirectSubclassesOf$1874(parentClass$1889), function (subClass$1892) {
                    method$1885.calls.push({
                        type: invoke$1888.type,
                        name: [
                            subClass$1892,
                            methodName$1890
                        ].join('.'),
                        line: invoke$1888.line,
                        params: invoke$1888.params,
                        signature: invoke$1888.signature.replace(parentClass$1889, subClass$1892),
                        isInferred: true
                    });
                });
            }
        });
    });
    readSourcesAndSinks$1742(function (sources$1893, sinks$1894) {
        _$1698.forEach(methods$1869, function (m$1896, mSig$1897) {
            _$1698.forEach(m$1896.calls, function (invoke$1899) {
                if (invoke$1899.signature in sources$1893) {
                    if (!m$1896.risks)
                        m$1896.risks = [];
                    invoke$1899.isSource = true;
                    invoke$1899.category = sources$1893[invoke$1899.signature].category;
                    m$1896.risks.push(invoke$1899);
                }
                if (invoke$1899.signature in sinks$1894) {
                    if (!m$1896.risks)
                        m$1896.risks = [];
                    invoke$1899.isSink = true;
                    invoke$1899.category = sinks$1894[invoke$1899.signature].category;
                    m$1896.risks.push(invoke$1899);
                }
            });
        });
        onComplete$1868({
            classes: outClasses$1870,
            methods: methods$1869
        });
    });
};
function getMethodSig$1731(m$1900) {
    /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
    return [
        m$1900.clazz,
        m$1900.name
    ].join('.') + '(' + m$1900.params.join(',') + ') => ' + m$1900.ret;
}
function getMethodSigFromInvoke$1733(m$1901) {
    return m$1901.name + '(' + m$1901.params.join(',') + ') => ' + m$1901.ret;
}
function processFiles$1734(files$1902, classes$1903, onComplete$1904) {
    if (!classes$1903)
        classes$1903 = {};
    if (files$1902.length) {
        console.log(_$1698.last(files$1902));
        fs$1696.readFile(files$1902.pop(), { encoding: 'utf-8' }, function (err$1906, data$1907) {
            var clazz$1908 = matchClass$1726(parse$1697(data$1907));
            classes$1903[clazz$1908.name] = clazz$1908;
            processFiles$1734(files$1902, classes$1903, onComplete$1904);
        });
    } else {
        onFilesDone$1729(classes$1903, onComplete$1904);
    }
}
var NOT_EMPTY$1736 = function (m$1909) {
    return m$1909 != '';
};
function parseSourceSinkLine$1739(ln$1910) {
    var m$1911 = /\s*<([^:]*):\s(\S+)\s(\S+)\(([^)]*)\)>\s*((?:\S+\s+)*)\(([^)]+)\)\s*/.exec(ln$1910);
    if (m$1911) {
        m$1911 = m$1911.slice(1);
        // matched groups 
        return {
            clazz: m$1911[0],
            ret: m$1911[1],
            name: m$1911[2],
            params: _$1698.filter(m$1911[3].split(','), NOT_EMPTY$1736),
            permissions: m$1911[4].split(' '),
            category: m$1911[5].replace('NO_CATEGORY', 'GENERAL').replace('_INFORMATION', '').replace('SYNCHRONIZATION', 'SYNC')
        };
    } else {
        console.log('Ignoring source/sink line: ' + ln$1910);
    }
}
function parseSourceSinkList$1741(path$1912, onComplete$1913) {
    fs$1696.readFile(path$1912, { encoding: 'utf-8' }, function (err$1915, data$1916) {
        if (!!err$1915)
            throw err$1915;
        var lines$1917 = data$1916.split('\n');
        var parsed$1918 = _$1698.chain(lines$1917).map(parseSourceSinkLine$1739).filter(NOT_NULL$1701).value();
        onComplete$1913(parsed$1918);
    });
}
function readSourcesAndSinks$1742(onComplete$1919) {
    parseSourceSinkList$1741('data/sources_list', function (sources$1921) {
        parseSourceSinkList$1741('data/sinks_list', function (sinks$1923) {
            var outSources$1924 = {};
            var outSinks$1925 = {};
            _$1698.forEach(sources$1921, function (src$1928) {
                outSources$1924[getMethodSig$1731(src$1928)] = src$1928;
            });
            _$1698.forEach(sinks$1923, function (sink$1929) {
                outSinks$1925[getMethodSig$1731(sink$1929)] = sink$1929;
            });
            onComplete$1919(outSources$1924, outSinks$1925);
        });
    });
}
exports.getSourceSinkPaths = function (path$1930, callback$1931) {
    fs$1696.readFile(path$1930, { encoding: 'utf-8' }, function (err$1933, data$1934) {
        if (!!err$1933)
            throw err$1933;
        var paths$1935 = parseSourceSinkPaths$1713(data$1934);
        _$1698.forEach(paths$1935, function (path$1937) {
            path$1937[0].category = 'SOURCE', path$1937[path$1937.length - 1].category = 'SINK';
        });
        callback$1931(paths$1935);
    });
};
exports.getCallGraph = function (path$1938, onComplete$1939) {
    find$1699(path$1938, function (err$1941, files$1942) {
        if (!!err$1941)
            throw err$1941;
        /* filter out android support lib files */
        var appFiles$1944 = _$1698.filter(files$1942, function (f$1945) {
                return f$1945.indexOf('android/support') == -1;
            });
        processFiles$1734(appFiles$1944, null, onComplete$1939);
    });
};
