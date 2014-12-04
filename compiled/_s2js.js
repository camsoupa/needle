var fs$1696 = require('fs'), parse$1697 = require('sexpression').parse, _$1698 = require('lodash'), find$1699 = require('recursive-readdir');
var NOT_NULL$1701 = function (m$1736) {
    return !!m$1736;
};
/* extracts a javascript encoded symbol for pattern matching */
var S$1702 = {
        getSymbolName: function (a0$1742) {
            if (a0$1742 != null) {
                var r0$1743 = Object(a0$1742);
                if (':' in r0$1743) {
                    var name$1744 = r0$1743[':'];
                    return name$1744;
                }
            }
            return null;
        },
        hasInstance: function (x$1745) {
            return !!S$1702.getSymbolName(x$1745);
        },
        unapply: function (x$1746) {
            var name$1747 = S$1702.getSymbolName(x$1746);
            if (name$1747) {
                return [name$1747];
            }
        }
    };
function matchType$1709(a0$1748) {
    if ((Array.isArray ? Array.isArray(a0$1748) : Object.prototype.toString.call(a0$1748) === '[object Array]') && a0$1748.length === 2) {
        var r0$1750 = a0$1748[0];
        var r1$1751 = S$1702.unapply(r0$1750);
        if (r1$1751 != null && r1$1751.length === 1) {
            var r2$1752 = r1$1751[0];
            if (r2$1752 === 'array') {
                var type$1753 = a0$1748[1];
                return [matchType$1709(type$1753)];
            }
            if (r2$1752 === 'object') {
                var r3$1754 = a0$1748[1];
                var r4$1755 = S$1702.unapply(r3$1754);
                if (r4$1755 != null && r4$1755.length === 1) {
                    var className$1756 = r4$1755[0];
                    return className$1756.replace(/\//g, '.');
                }
            }
        }
    }
    var r5$1749 = S$1702.unapply(a0$1748);
    if (r5$1749 != null && r5$1749.length === 1) {
        var prim$1757 = r5$1749[0];
        return prim$1757;
    }
    throw new TypeError('No match');
}
function matchStmt$1713(a0$1758) {
    if (Array.isArray ? Array.isArray(a0$1758) : Object.prototype.toString.call(a0$1758) === '[object Array]') {
        if (a0$1758.length === 5) {
            var r0$1759 = a0$1758[0];
            var r1$1760 = S$1702.unapply(r0$1759);
            if (r1$1760 != null && r1$1760.length === 1) {
                var r2$1761 = a0$1758[2];
                var r3$1762 = S$1702.unapply(r2$1761);
                if (r3$1762 != null && (r3$1762.length === 1 && !r1$1760[0].indexOf('invoke'))) {
                    var type$1763 = r1$1760[0];
                    var regs$1764 = a0$1758[1];
                    var name$1765 = r3$1762[0];
                    var params$1766 = a0$1758[3];
                    var ret$1767 = a0$1758[4];
                    var invoke$1768 = {
                            type: type$1763,
                            name: name$1765.replace(/\//g, '.'),
                            params: _$1698.map(params$1766, matchType$1709),
                            ret: matchType$1709(ret$1767)
                        };
                    invoke$1768.signature = getMethodSigFromInvoke$1725(invoke$1768);
                    return invoke$1768;
                }
            }
        }
        if (a0$1758.length === 6) {
            var r4$1769 = a0$1758[0];
            var r5$1770 = S$1702.unapply(r4$1769);
            if (r5$1770 != null && r5$1770.length === 1) {
                var r6$1771 = a0$1758[2];
                if ((Array.isArray ? Array.isArray(r6$1771) : Object.prototype.toString.call(r6$1771) === '[object Array]') && r6$1771.length === 2) {
                    var r7$1772 = r6$1771[0];
                    var r8$1773 = S$1702.unapply(r7$1772);
                    if (r8$1773 != null && r8$1773.length === 1) {
                        var r9$1774 = r8$1773[0];
                        if (r9$1774 === 'array') {
                            var r10$1775 = a0$1758[3];
                            var r11$1776 = S$1702.unapply(r10$1775);
                            if (r11$1776 != null && r11$1776.length === 1) {
                                var type$1763 = r5$1770[0];
                                var regs$1764 = a0$1758[1];
                                var array_type$1777 = r6$1771[1];
                                var name$1765 = r11$1776[0];
                                var params$1766 = a0$1758[4];
                                var ret$1767 = a0$1758[5];
                                var invoke$1768 = {
                                        type: type$1763,
                                        name: matchType$1709(array_type$1777) + '[]' + name$1765.replace(/\//g, '.'),
                                        params: _$1698.map(params$1766, matchType$1709),
                                        ret: matchType$1709(ret$1767)
                                    };
                                invoke$1768.signature = getMethodSigFromInvoke$1725(invoke$1768);
                                return invoke$1768;
                            }
                        }
                    }
                }
            }
        }
        if (a0$1758.length === 2) {
            var r12$1778 = a0$1758[0];
            var r13$1779 = S$1702.unapply(r12$1778);
            if (r13$1779 != null && r13$1779.length === 1) {
                var r14$1780 = r13$1779[0];
                if (r14$1780 === 'line') {
                    var ln$1781 = a0$1758[1];
                    return ln$1781;
                }
            }
        }
    }
    return null;
}
function matchMethodDef$1717(a0$1782) {
    if ((Array.isArray ? Array.isArray(a0$1782) : Object.prototype.toString.call(a0$1782) === '[object Array]') && a0$1782.length >= 5) {
        var r0$1783 = a0$1782[0];
        var r1$1784 = S$1702.unapply(r0$1783);
        if (r1$1784 != null && r1$1784.length === 1) {
            var r2$1785 = r1$1784[0];
            if (r2$1785 === 'method') {
                var r3$1786 = a0$1782[1];
                if ((Array.isArray ? Array.isArray(r3$1786) : Object.prototype.toString.call(r3$1786) === '[object Array]') && r3$1786.length >= 1) {
                    var r4$1787 = r3$1786[0];
                    var r5$1788 = S$1702.unapply(r4$1787);
                    if (r5$1788 != null && r5$1788.length === 1) {
                        var r6$1789 = r5$1788[0];
                        if (r6$1789 === 'attrs') {
                            var r7$1790 = [];
                            var r8$1791 = 1;
                            for (var r9$1792 = 1, r10$1793 = r3$1786.length, r11$1794; r9$1792 < r10$1793; r9$1792++) {
                                r11$1794 = r3$1786[r9$1792];
                                r7$1790[r7$1790.length] = r11$1794;
                            }
                            if (r8$1791) {
                                var r12$1795 = a0$1782[2];
                                var r13$1796 = S$1702.unapply(r12$1795);
                                if (r13$1796 != null && r13$1796.length === 1) {
                                    var r14$1797 = [];
                                    var r15$1798 = 1;
                                    for (var r16$1799 = 5, r17$1800 = a0$1782.length, r18$1801; r16$1799 < r17$1800; r16$1799++) {
                                        r18$1801 = a0$1782[r16$1799];
                                        r14$1797[r14$1797.length] = r18$1801;
                                    }
                                    if (r15$1798) {
                                        var attrs$1802 = r7$1790;
                                        var name$1803 = r13$1796[0];
                                        var params$1804 = a0$1782[3];
                                        var ret$1805 = a0$1782[4];
                                        var body$1806 = r14$1797;
                                        var lines$1807 = [];
                                        var calls$1808 = [];
                                        var stmts$1809 = _$1698.chain(body$1806).map(matchStmt$1713).filter(NOT_NULL$1701).value();
                                        _$1698.forEach(stmts$1809, function (stmt$1811) {
                                            if (typeof stmt$1811 === 'number') {
                                                lines$1807.push(stmt$1811);
                                            } else {
                                                stmt$1811.line = _$1698.last(lines$1807);
                                                calls$1808.push(stmt$1811);
                                            }
                                        });
                                        return {
                                            type: 'method',
                                            name: name$1803,
                                            startLine: lines$1807[0],
                                            endLine: _$1698.last(lines$1807),
                                            attrs: _$1698.map(attrs$1802, S$1702.getSymbolName),
                                            params: _$1698.map(params$1804, matchType$1709),
                                            ret: matchType$1709(ret$1805),
                                            calls: calls$1808
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
function matchClass$1718(a0$1812) {
    if ((Array.isArray ? Array.isArray(a0$1812) : Object.prototype.toString.call(a0$1812) === '[object Array]') && a0$1812.length >= 5) {
        var r0$1813 = a0$1812[0];
        var r1$1814 = S$1702.unapply(r0$1813);
        if (r1$1814 != null && r1$1814.length === 1) {
            var r2$1815 = a0$1812[1];
            if ((Array.isArray ? Array.isArray(r2$1815) : Object.prototype.toString.call(r2$1815) === '[object Array]') && r2$1815.length >= 1) {
                var r3$1816 = r2$1815[0];
                var r4$1817 = S$1702.unapply(r3$1816);
                if (r4$1817 != null && r4$1817.length === 1) {
                    var r5$1818 = r4$1817[0];
                    if (r5$1818 === 'attrs') {
                        var r6$1819 = [];
                        var r7$1820 = 1;
                        for (var r8$1821 = 1, r9$1822 = r2$1815.length, r10$1823; r8$1821 < r9$1822; r8$1821++) {
                            r10$1823 = r2$1815[r8$1821];
                            r6$1819[r6$1819.length] = r10$1823;
                        }
                        if (r7$1820) {
                            var r11$1824 = a0$1812[2];
                            var r12$1825 = S$1702.unapply(r11$1824);
                            if (r12$1825 != null && r12$1825.length === 1) {
                                var r13$1826 = a0$1812[3];
                                if ((Array.isArray ? Array.isArray(r13$1826) : Object.prototype.toString.call(r13$1826) === '[object Array]') && r13$1826.length === 2) {
                                    var r14$1827 = r13$1826[0];
                                    var r15$1828 = S$1702.unapply(r14$1827);
                                    if (r15$1828 != null && r15$1828.length === 1) {
                                        var r16$1829 = r15$1828[0];
                                        if (r16$1829 === 'super') {
                                            var r17$1830 = r13$1826[1];
                                            var r18$1831 = S$1702.unapply(r17$1830);
                                            if (r18$1831 != null && r18$1831.length === 1) {
                                                var r19$1832 = a0$1812[4];
                                                if ((Array.isArray ? Array.isArray(r19$1832) : Object.prototype.toString.call(r19$1832) === '[object Array]') && r19$1832.length === 2) {
                                                    var r20$1833 = r19$1832[0];
                                                    var r21$1834 = S$1702.unapply(r20$1833);
                                                    if (r21$1834 != null && r21$1834.length === 1) {
                                                        var r22$1835 = r21$1834[0];
                                                        if (r22$1835 === 'source') {
                                                            var r23$1836 = [];
                                                            var r24$1837 = 1;
                                                            for (var r25$1838 = 5, r26$1839 = a0$1812.length, r27$1840; r25$1838 < r26$1839; r25$1838++) {
                                                                r27$1840 = a0$1812[r25$1838];
                                                                r23$1836[r23$1836.length] = r27$1840;
                                                            }
                                                            if (r24$1837 && (r1$1814[0] === 'class' || r1$1814[0] == 'interface')) {
                                                                var type$1841 = r1$1814[0];
                                                                var attrs$1842 = r6$1819;
                                                                var clazz$1843 = r12$1825[0];
                                                                var parent$1844 = r18$1831[0];
                                                                var file$1845 = r19$1832[1];
                                                                var members$1846 = r23$1836;
                                                                clazz$1843 = clazz$1843.replace(/\//g, '.');
                                                                parent$1844 = parent$1844.replace(/\//g, '.');
                                                                return {
                                                                    type: type$1841,
                                                                    file: file$1845,
                                                                    name: clazz$1843,
                                                                    parent: parent$1844,
                                                                    attrs: _$1698.map(attrs$1842, S$1702.getSymbolName),
                                                                    methods: _$1698.chain(members$1846).map(matchMethodDef$1717).filter(NOT_NULL$1701).map(function (m$1848) {
                                                                        m$1848.clazz = clazz$1843;
                                                                        m$1848.file = file$1845;
                                                                        return m$1848;
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
var onFilesDone$1721 = function (classes$1849, onComplete$1850) {
    var methods$1851 = {};
    var outClasses$1852 = {};
    _$1698.forEach(classes$1849, function (clazz$1859) {
        outClasses$1852[clazz$1859.name] = {
            type: clazz$1859.type,
            file: clazz$1859.file,
            name: clazz$1859.name,
            parent: clazz$1859.parent,
            attrs: clazz$1859.attrs,
            methods: [],
            subClasses: []
        };
        _$1698.forEach(clazz$1859.methods, function (method$1861) {
            var sig$1862 = getMethodSig$1723(method$1861);
            methods$1851[sig$1862] = method$1861;
            outClasses$1852[clazz$1859.name].methods.push(sig$1862);
        });
    });
    /* put all parent classes into the outClasses - TODO should we pull in the source code too for java.util, etc? */
    _$1698.forEach(_$1698.clone(outClasses$1852), function (clazz$1863) {
        if (clazz$1863.parent) {
            if (!(clazz$1863.parent in outClasses$1852)) {
                outClasses$1852[clazz$1863.parent] = {
                    name: clazz$1863.parent,
                    external: true,
                    methods: [],
                    subClasses: [clazz$1863.name]
                };
            } else {
                outClasses$1852[clazz$1863.parent].subClasses.push(clazz$1863.name);
            }
        } else {
            console.log('NO PARENT FOR: ' + clazz$1863.name);
        }
    });
    /* TODO consider if all indirectSubclasses is really what we want */
    function indirectSubclassesOf$1856(className$1864) {
        if (!className$1864 || !(className$1864 in outClasses$1852))
            return [];
        /* i.e. - no known subclasses */
        return _$1698.flatten(outClasses$1852[className$1864].subClasses.concat(_$1698.map(outClasses$1852[className$1864].subClasses, function (sub$1866) {
            return indirectSubclassesOf$1856(sub$1866);
        })));
    }
    /* including direct and indirect subClasses in calls for invoke-virtual and invoke-interface */
    _$1698.forEach(methods$1851, function (method$1867, methodSig$1868) {
        _$1698.forEach(method$1867.calls, function (invoke$1870) {
            if (invoke$1870.type == 'invoke-virtual' || invoke$1870.type == 'invoke-interface') {
                /* add known subTypes of the called class to the calls list */
                var parentClass$1871 = invoke$1870.name.split('.').slice(0, -1).join('.');
                var methodName$1872 = invoke$1870.name.split('.').pop();
                _$1698.forEach(indirectSubclassesOf$1856(parentClass$1871), function (subClass$1874) {
                    method$1867.calls.push({
                        type: invoke$1870.type,
                        name: [
                            subClass$1874,
                            methodName$1872
                        ].join('.'),
                        line: invoke$1870.line,
                        params: invoke$1870.params,
                        signature: invoke$1870.signature.replace(parentClass$1871, subClass$1874),
                        isInferred: true
                    });
                });
            }
        });
    });
    readSourcesAndSinks$1734(function (sources$1875, sinks$1876) {
        _$1698.forEach(methods$1851, function (m$1878, mSig$1879) {
            _$1698.forEach(m$1878.calls, function (invoke$1881) {
                if (invoke$1881.signature in sources$1875) {
                    if (!m$1878.risks)
                        m$1878.risks = [];
                    invoke$1881.isSource = true;
                    invoke$1881.category = sources$1875[invoke$1881.signature].category;
                    m$1878.risks.push(invoke$1881);
                }
                if (invoke$1881.signature in sinks$1876) {
                    if (!m$1878.risks)
                        m$1878.risks = [];
                    invoke$1881.isSink = true;
                    invoke$1881.category = sinks$1876[invoke$1881.signature].category;
                    m$1878.risks.push(invoke$1881);
                }
            });
        });
        onComplete$1850({
            classes: outClasses$1852,
            methods: methods$1851
        });
    });
};
function getMethodSig$1723(m$1882) {
    /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
    return [
        m$1882.clazz,
        m$1882.name
    ].join('.') + '(' + m$1882.params.join(',') + ') => ' + m$1882.ret;
}
function getMethodSigFromInvoke$1725(m$1883) {
    return m$1883.name + '(' + m$1883.params.join(',') + ') => ' + m$1883.ret;
}
function processFiles$1726(files$1884, classes$1885, onComplete$1886) {
    if (!classes$1885)
        classes$1885 = {};
    if (files$1884.length) {
        console.log(_$1698.last(files$1884));
        fs$1696.readFile(files$1884.pop(), { encoding: 'utf-8' }, function (err$1888, data$1889) {
            var clazz$1890 = matchClass$1718(parse$1697(data$1889));
            classes$1885[clazz$1890.name] = clazz$1890;
            processFiles$1726(files$1884, classes$1885, onComplete$1886);
        });
    } else {
        onFilesDone$1721(classes$1885, onComplete$1886);
    }
}
var NOT_EMPTY$1728 = function (m$1891) {
    return m$1891 != '';
};
function parseSourceSinkLine$1731(ln$1892) {
    var m$1893 = /\s*<([^:]*):\s(\S+)\s(\S+)\(([^)]*)\)>\s*((?:\S+\s+)*)\(([^)]+)\)\s*/.exec(ln$1892);
    if (m$1893) {
        m$1893 = m$1893.slice(1);
        // matched groups 
        return {
            clazz: m$1893[0],
            ret: m$1893[1],
            name: m$1893[2],
            params: _$1698.filter(m$1893[3].split(','), NOT_EMPTY$1728),
            permissions: m$1893[4].split(' '),
            category: m$1893[5].replace('NO_CATEGORY', 'GENERAL').replace('_INFORMATION', '').replace('SYNCHRONIZATION', 'SYNC')
        };
    } else {
        console.log('Ignoring source/sink line: ' + ln$1892);
    }
}
function parseSourceSinkList$1733(path$1894, onComplete$1895) {
    fs$1696.readFile(path$1894, { encoding: 'utf-8' }, function (err$1897, data$1898) {
        if (!!err$1897)
            throw err$1897;
        var lines$1899 = data$1898.split('\n');
        var parsed$1900 = _$1698.chain(lines$1899).map(parseSourceSinkLine$1731).filter(NOT_NULL$1701).value();
        onComplete$1895(parsed$1900);
    });
}
function readSourcesAndSinks$1734(onComplete$1901) {
    parseSourceSinkList$1733('data/sources_list', function (sources$1903) {
        parseSourceSinkList$1733('data/sinks_list', function (sinks$1905) {
            var outSources$1906 = {};
            var outSinks$1907 = {};
            _$1698.forEach(sources$1903, function (src$1910) {
                outSources$1906[getMethodSig$1723(src$1910)] = src$1910;
            });
            _$1698.forEach(sinks$1905, function (sink$1911) {
                outSinks$1907[getMethodSig$1723(sink$1911)] = sink$1911;
            });
            onComplete$1901(outSources$1906, outSinks$1907);
        });
    });
}
exports.getCallGraph = function (path$1912, onComplete$1913) {
    find$1699(path$1912, function (err$1915, files$1916) {
        if (!!err$1915)
            throw err$1915;
        /* filter out android support lib files */
        var appFiles$1918 = _$1698.filter(files$1916, function (f$1919) {
                return f$1919.indexOf('android/support') == -1;
            });
        processFiles$1726(appFiles$1918, null, onComplete$1913);
    });
};
