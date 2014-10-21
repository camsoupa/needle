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
        if (a0$1758.length === 2) {
            var r4$1769 = a0$1758[0];
            var r5$1770 = S$1702.unapply(r4$1769);
            if (r5$1770 != null && r5$1770.length === 1) {
                var r6$1771 = r5$1770[0];
                if (r6$1771 === 'line') {
                    var ln$1772 = a0$1758[1];
                    return ln$1772;
                }
            }
        }
    }
    return null;
}
function matchMethodDef$1717(a0$1773) {
    if ((Array.isArray ? Array.isArray(a0$1773) : Object.prototype.toString.call(a0$1773) === '[object Array]') && a0$1773.length >= 5) {
        var r0$1774 = a0$1773[0];
        var r1$1775 = S$1702.unapply(r0$1774);
        if (r1$1775 != null && r1$1775.length === 1) {
            var r2$1776 = r1$1775[0];
            if (r2$1776 === 'method') {
                var r3$1777 = a0$1773[1];
                if ((Array.isArray ? Array.isArray(r3$1777) : Object.prototype.toString.call(r3$1777) === '[object Array]') && r3$1777.length >= 1) {
                    var r4$1778 = r3$1777[0];
                    var r5$1779 = S$1702.unapply(r4$1778);
                    if (r5$1779 != null && r5$1779.length === 1) {
                        var r6$1780 = r5$1779[0];
                        if (r6$1780 === 'attrs') {
                            var r7$1781 = [];
                            var r8$1782 = 1;
                            for (var r9$1783 = 1, r10$1784 = r3$1777.length, r11$1785; r9$1783 < r10$1784; r9$1783++) {
                                r11$1785 = r3$1777[r9$1783];
                                r7$1781[r7$1781.length] = r11$1785;
                            }
                            if (r8$1782) {
                                var r12$1786 = a0$1773[2];
                                var r13$1787 = S$1702.unapply(r12$1786);
                                if (r13$1787 != null && r13$1787.length === 1) {
                                    var r14$1788 = [];
                                    var r15$1789 = 1;
                                    for (var r16$1790 = 5, r17$1791 = a0$1773.length, r18$1792; r16$1790 < r17$1791; r16$1790++) {
                                        r18$1792 = a0$1773[r16$1790];
                                        r14$1788[r14$1788.length] = r18$1792;
                                    }
                                    if (r15$1789) {
                                        var attrs$1793 = r7$1781;
                                        var name$1794 = r13$1787[0];
                                        var params$1795 = a0$1773[3];
                                        var ret$1796 = a0$1773[4];
                                        var body$1797 = r14$1788;
                                        var lines$1798 = [];
                                        var calls$1799 = [];
                                        var stmts$1800 = _$1698.chain(body$1797).map(matchStmt$1713).filter(NOT_NULL$1701).value();
                                        _$1698.forEach(stmts$1800, function (stmt$1802) {
                                            if (typeof stmt$1802 === 'number') {
                                                lines$1798.push(stmt$1802);
                                            } else {
                                                stmt$1802.line = _$1698.last(lines$1798);
                                                calls$1799.push(stmt$1802);
                                            }
                                        });
                                        return {
                                            type: 'method',
                                            name: name$1794,
                                            startLine: lines$1798[0],
                                            endLine: _$1698.last(lines$1798),
                                            attrs: _$1698.map(attrs$1793, S$1702.getSymbolName),
                                            params: _$1698.map(params$1795, matchType$1709),
                                            ret: matchType$1709(ret$1796),
                                            calls: calls$1799
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
function matchClass$1718(a0$1803) {
    if ((Array.isArray ? Array.isArray(a0$1803) : Object.prototype.toString.call(a0$1803) === '[object Array]') && a0$1803.length >= 5) {
        var r0$1804 = a0$1803[0];
        var r1$1805 = S$1702.unapply(r0$1804);
        if (r1$1805 != null && r1$1805.length === 1) {
            var r2$1806 = a0$1803[1];
            if ((Array.isArray ? Array.isArray(r2$1806) : Object.prototype.toString.call(r2$1806) === '[object Array]') && r2$1806.length >= 1) {
                var r3$1807 = r2$1806[0];
                var r4$1808 = S$1702.unapply(r3$1807);
                if (r4$1808 != null && r4$1808.length === 1) {
                    var r5$1809 = r4$1808[0];
                    if (r5$1809 === 'attrs') {
                        var r6$1810 = [];
                        var r7$1811 = 1;
                        for (var r8$1812 = 1, r9$1813 = r2$1806.length, r10$1814; r8$1812 < r9$1813; r8$1812++) {
                            r10$1814 = r2$1806[r8$1812];
                            r6$1810[r6$1810.length] = r10$1814;
                        }
                        if (r7$1811) {
                            var r11$1815 = a0$1803[2];
                            var r12$1816 = S$1702.unapply(r11$1815);
                            if (r12$1816 != null && r12$1816.length === 1) {
                                var r13$1817 = a0$1803[3];
                                if ((Array.isArray ? Array.isArray(r13$1817) : Object.prototype.toString.call(r13$1817) === '[object Array]') && r13$1817.length === 2) {
                                    var r14$1818 = r13$1817[0];
                                    var r15$1819 = S$1702.unapply(r14$1818);
                                    if (r15$1819 != null && r15$1819.length === 1) {
                                        var r16$1820 = r15$1819[0];
                                        if (r16$1820 === 'super') {
                                            var r17$1821 = r13$1817[1];
                                            var r18$1822 = S$1702.unapply(r17$1821);
                                            if (r18$1822 != null && r18$1822.length === 1) {
                                                var r19$1823 = a0$1803[4];
                                                if ((Array.isArray ? Array.isArray(r19$1823) : Object.prototype.toString.call(r19$1823) === '[object Array]') && r19$1823.length === 2) {
                                                    var r20$1824 = r19$1823[0];
                                                    var r21$1825 = S$1702.unapply(r20$1824);
                                                    if (r21$1825 != null && r21$1825.length === 1) {
                                                        var r22$1826 = r21$1825[0];
                                                        if (r22$1826 === 'source') {
                                                            var r23$1827 = [];
                                                            var r24$1828 = 1;
                                                            for (var r25$1829 = 5, r26$1830 = a0$1803.length, r27$1831; r25$1829 < r26$1830; r25$1829++) {
                                                                r27$1831 = a0$1803[r25$1829];
                                                                r23$1827[r23$1827.length] = r27$1831;
                                                            }
                                                            if (r24$1828 && (r1$1805[0] === 'class' || r1$1805[0] == 'interface')) {
                                                                var type$1832 = r1$1805[0];
                                                                var attrs$1833 = r6$1810;
                                                                var clazz$1834 = r12$1816[0];
                                                                var parent$1835 = r18$1822[0];
                                                                var file$1836 = r19$1823[1];
                                                                var members$1837 = r23$1827;
                                                                clazz$1834 = clazz$1834.replace(/\//g, '.');
                                                                parent$1835 = parent$1835.replace(/\//g, '.');
                                                                return {
                                                                    type: type$1832,
                                                                    file: file$1836,
                                                                    name: clazz$1834,
                                                                    parent: parent$1835,
                                                                    attrs: _$1698.map(attrs$1833, S$1702.getSymbolName),
                                                                    methods: _$1698.chain(members$1837).map(matchMethodDef$1717).filter(NOT_NULL$1701).map(function (m$1839) {
                                                                        m$1839.clazz = clazz$1834;
                                                                        m$1839.file = file$1836;
                                                                        return m$1839;
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
var onFilesDone$1721 = function (classes$1840, onComplete$1841) {
    var methods$1842 = {};
    var outClasses$1843 = {};
    _$1698.forEach(classes$1840, function (clazz$1850) {
        outClasses$1843[clazz$1850.name] = {
            type: clazz$1850.type,
            file: clazz$1850.file,
            name: clazz$1850.name,
            parent: clazz$1850.parent,
            attrs: clazz$1850.attrs,
            methods: [],
            subClasses: []
        };
        _$1698.forEach(clazz$1850.methods, function (method$1852) {
            var sig$1853 = getMethodSig$1723(method$1852);
            methods$1842[sig$1853] = method$1852;
            outClasses$1843[clazz$1850.name].methods.push(sig$1853);
        });
    });
    /* put all parent classes into the outClasses - TODO should we pull in the source code too for java.util, etc? */
    _$1698.forEach(_$1698.clone(outClasses$1843), function (clazz$1854) {
        if (clazz$1854.parent) {
            if (!(clazz$1854.parent in outClasses$1843)) {
                outClasses$1843[clazz$1854.parent] = {
                    name: clazz$1854.parent,
                    external: true,
                    methods: [],
                    subClasses: [clazz$1854.name]
                };
            } else {
                outClasses$1843[clazz$1854.parent].subClasses.push(clazz$1854.name);
            }
        } else {
            console.log('NO PARENT FOR: ' + clazz$1854.name);
        }
    });
    /* TODO consider if all indirectSubclasses is really what we want */
    function indirectSubclassesOf$1847(className$1855) {
        if (!className$1855 || !(className$1855 in outClasses$1843))
            return [];
        /* i.e. - no known subclasses */
        return _$1698.flatten(outClasses$1843[className$1855].subClasses.concat(_$1698.map(outClasses$1843[className$1855].subClasses, function (sub$1857) {
            return indirectSubclassesOf$1847(sub$1857);
        })));
    }
    /* including direct and indirect subClasses in calls for invoke-virtual and invoke-interface */
    _$1698.forEach(methods$1842, function (method$1858, methodSig$1859) {
        _$1698.forEach(method$1858.calls, function (invoke$1861) {
            if (invoke$1861.type == 'invoke-virtual' || invoke$1861.type == 'invoke-interface') {
                /* add known subTypes of the called class to the calls list */
                var parentClass$1862 = invoke$1861.name.split('.').slice(0, -1).join('.');
                var methodName$1863 = invoke$1861.name.split('.').pop();
                _$1698.forEach(indirectSubclassesOf$1847(parentClass$1862), function (subClass$1865) {
                    method$1858.calls.push({
                        type: invoke$1861.type,
                        name: [
                            subClass$1865,
                            methodName$1863
                        ].join('.'),
                        line: invoke$1861.line,
                        params: invoke$1861.params,
                        signature: invoke$1861.signature.replace(parentClass$1862, subClass$1865),
                        isInferred: true
                    });
                });
            }
        });
    });
    readSourcesAndSinks$1734(function (sources$1866, sinks$1867) {
        _$1698.forEach(methods$1842, function (m$1869, mSig$1870) {
            _$1698.forEach(m$1869.calls, function (invoke$1872) {
                if (invoke$1872.signature in sources$1866) {
                    if (!m$1869.risks)
                        m$1869.risks = [];
                    invoke$1872.isSource = true;
                    invoke$1872.category = sources$1866[invoke$1872.signature].category;
                    m$1869.risks.push(invoke$1872);
                }
                if (invoke$1872.signature in sinks$1867) {
                    if (!m$1869.risks)
                        m$1869.risks = [];
                    invoke$1872.isSink = true;
                    invoke$1872.category = sinks$1867[invoke$1872.signature].category;
                    m$1869.risks.push(invoke$1872);
                }
            });
        });
        onComplete$1841({
            classes: outClasses$1843,
            methods: methods$1842
        });
    });
};
function getMethodSig$1723(m$1873) {
    /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
    return [
        m$1873.clazz,
        m$1873.name
    ].join('.') + '(' + m$1873.params.join(',') + ') => ' + m$1873.ret;
}
function getMethodSigFromInvoke$1725(m$1874) {
    return m$1874.name + '(' + m$1874.params.join(',') + ') => ' + m$1874.ret;
}
function processFiles$1726(files$1875, classes$1876, onComplete$1877) {
    if (!classes$1876)
        classes$1876 = {};
    if (files$1875.length) {
        console.log(_$1698.last(files$1875));
        fs$1696.readFile(files$1875.pop(), { encoding: 'utf-8' }, function (err$1879, data$1880) {
            var clazz$1881 = matchClass$1718(parse$1697(data$1880));
            classes$1876[clazz$1881.name] = clazz$1881;
            processFiles$1726(files$1875, classes$1876, onComplete$1877);
        });
    } else {
        onFilesDone$1721(classes$1876, onComplete$1877);
    }
}
var NOT_EMPTY$1728 = function (m$1882) {
    return m$1882 != '';
};
function parseSourceSinkLine$1731(ln$1883) {
    var m$1884 = /\s*<([^:]*):\s(\S+)\s(\S+)\(([^)]*)\)>\s*((?:\S+\s+)*)\(([^)]+)\)\s*/.exec(ln$1883);
    if (m$1884) {
        m$1884 = m$1884.slice(1);
        // matched groups 
        return {
            clazz: m$1884[0],
            ret: m$1884[1],
            name: m$1884[2],
            params: _$1698.filter(m$1884[3].split(','), NOT_EMPTY$1728),
            permissions: m$1884[4].split(' '),
            category: m$1884[5].replace('NO_CATEGORY', 'GENERAL').replace('_INFORMATION', '').replace('SYNCHRONIZATION', 'SYNC')
        };
    } else {
        console.log('Ignoring source/sink line: ' + ln$1883);
    }
}
function parseSourceSinkList$1733(path$1885, onComplete$1886) {
    fs$1696.readFile(path$1885, { encoding: 'utf-8' }, function (err$1888, data$1889) {
        if (!!err$1888)
            throw err$1888;
        var lines$1890 = data$1889.split('\n');
        var parsed$1891 = _$1698.chain(lines$1890).map(parseSourceSinkLine$1731).filter(NOT_NULL$1701).value();
        onComplete$1886(parsed$1891);
    });
}
function readSourcesAndSinks$1734(onComplete$1892) {
    parseSourceSinkList$1733('data/sources_list', function (sources$1894) {
        parseSourceSinkList$1733('data/sinks_list', function (sinks$1896) {
            var outSources$1897 = {};
            var outSinks$1898 = {};
            _$1698.forEach(sources$1894, function (src$1901) {
                outSources$1897[getMethodSig$1723(src$1901)] = src$1901;
            });
            _$1698.forEach(sinks$1896, function (sink$1902) {
                outSinks$1898[getMethodSig$1723(sink$1902)] = sink$1902;
            });
            onComplete$1892(outSources$1897, outSinks$1898);
        });
    });
}
exports.getCallGraph = function (path$1903, onComplete$1904) {
    find$1699(path$1903, function (err$1906, files$1907) {
        if (!!err$1906)
            throw err$1906;
        processFiles$1726(files$1907, null, onComplete$1904);
    });
};
