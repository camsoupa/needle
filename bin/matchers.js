var _$1702 = require('lodash');
var NOT_NULL$1704 = function (m$1734) {
    return !!m$1734;
};
var NOT_EMPTY$1706 = function (m$1735) {
    return m$1735 != '';
};
function getMethodSignature$1709(m$1736) {
    return [
        /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
        m$1736.clazz,
        m$1736.name
    ].join('.') + '(' + m$1736.params.join(',') + ') => ' + m$1736.ret;
}
function getMethodSigFromInvoke$1711(m$1737) {
    return m$1737.name + '(' + m$1737.params.join(',') + ') => ' + m$1737.ret;
}
function class2Filename$1712(className$1738) {
    return className$1738.split('$')[0].replace(/\./g, '/');
}
var S$1713 = {
    /* extracts a javascript encoded symbol for pattern matching */
    getSymbolName: function (a0$1744) {
        if (a0$1744 != null) {
            var r0$1745 = Object(a0$1744);
            if (':' in r0$1745) {
                var name$1746 = r0$1745[':'];
                return name$1746;
            }
        }
        return null;
    },
    hasInstance: function (x$1747) {
        return !!S$1713.getSymbolName(x$1747);
    },
    unapply: function (x$1748) {
        var name$1749 = S$1713.getSymbolName(x$1748);
        if (name$1749) {
            return [name$1749];
        }
    }
};
function matchPathNode$1720(a0$1750) {
    if ((Array.isArray ? Array.isArray(a0$1750) : Object.prototype.toString.call(a0$1750) === '[object Array]') && a0$1750.length === 3) {
        var className$1752 = a0$1750[0];
        var stmt$1753 = a0$1750[1];
        var ln$1754 = a0$1750[2];
        return {
            className: className$1752,
            filename: class2Filename$1712(className$1752),
            stmt: stmt$1753,
            line: ln$1754
        };
    }
    var x$1751 = a0$1750;
    console.log(x$1751);
    throw 'matchPathNode failed!';
    return;
}
function matchType$1724(a0$1755) {
    if ((/** Matches .sxddx files */
        Array.isArray ? Array.isArray(a0$1755) : Object.prototype.toString.call(a0$1755) === '[object Array]') && a0$1755.length === 2) {
        var r0$1757 = a0$1755[0];
        var r1$1758 = S$1713.unapply(r0$1757);
        if (r1$1758 != null && r1$1758.length === 1) {
            var r2$1759 = r1$1758[0];
            if (r2$1759 === 'array') {
                var type$1760 = a0$1755[1];
                return [matchType$1724(type$1760)];
            }
            if (r2$1759 === 'object') {
                var r3$1761 = a0$1755[1];
                var r4$1762 = S$1713.unapply(r3$1761);
                if (r4$1762 != null && r4$1762.length === 1) {
                    var className$1763 = r4$1762[0];
                    return className$1763.replace(/\//g, '.');
                }
            }
        }
    }
    var r5$1756 = S$1713.unapply(a0$1755);
    if (r5$1756 != null && r5$1756.length === 1) {
        var prim$1764 = r5$1756[0];
        return prim$1764;
    }
    throw new TypeError('No match');
}
function matchStmt$1728(a0$1765) {
    if (Array.isArray ? Array.isArray(a0$1765) : Object.prototype.toString.call(a0$1765) === '[object Array]') {
        if (a0$1765.length === 5) {
            var r0$1766 = a0$1765[0];
            var r1$1767 = S$1713.unapply(r0$1766);
            if (r1$1767 != null && r1$1767.length === 1) {
                var r2$1768 = a0$1765[2];
                var r3$1769 = S$1713.unapply(r2$1768);
                if (r3$1769 != null && (r3$1769.length === 1 && !r1$1767[0].indexOf('invoke'))) {
                    var type$1770 = r1$1767[0];
                    var regs$1771 = a0$1765[1];
                    var name$1772 = r3$1769[0];
                    var params$1773 = a0$1765[3];
                    var ret$1774 = a0$1765[4];
                    var invoke$1775 = {
                        type: type$1770,
                        name: name$1772.replace(/\//g, '.'),
                        params: _$1702.map(params$1773, matchType$1724),
                        ret: matchType$1724(ret$1774)
                    };
                    invoke$1775.signature = getMethodSigFromInvoke$1711(invoke$1775);
                    return invoke$1775;
                }
            }
        }
        if (a0$1765.length === 6) {
            var r4$1776 = a0$1765[0];
            var r5$1777 = S$1713.unapply(r4$1776);
            if (r5$1777 != null && r5$1777.length === 1) {
                var r6$1778 = a0$1765[2];
                if ((Array.isArray ? Array.isArray(r6$1778) : Object.prototype.toString.call(r6$1778) === '[object Array]') && r6$1778.length === 2) {
                    var r7$1779 = r6$1778[0];
                    var r8$1780 = S$1713.unapply(r7$1779);
                    if (r8$1780 != null && r8$1780.length === 1) {
                        var r9$1781 = r8$1780[0];
                        if (r9$1781 === 'array') {
                            var r10$1782 = a0$1765[3];
                            var r11$1783 = S$1713.unapply(r10$1782);
                            if (r11$1783 != null && r11$1783.length === 1) {
                                var type$1770 = r5$1777[0];
                                var regs$1771 = a0$1765[1];
                                var array_type$1784 = r6$1778[1];
                                var name$1772 = r11$1783[0];
                                var params$1773 = a0$1765[4];
                                var ret$1774 = a0$1765[5];
                                var invoke$1775 = {
                                    type: type$1770,
                                    name: matchType$1724(array_type$1784) + '[]' + name$1772.replace(/\//g, '.'),
                                    params: _$1702.map(params$1773, matchType$1724),
                                    ret: matchType$1724(ret$1774)
                                };
                                invoke$1775.signature = getMethodSigFromInvoke$1711(invoke$1775);
                                return invoke$1775;
                            }
                        }
                    }
                }
            }
        }
        if (a0$1765.length === 2) {
            var r12$1785 = a0$1765[0];
            var r13$1786 = S$1713.unapply(r12$1785);
            if (r13$1786 != null && r13$1786.length === 1) {
                var r14$1787 = r13$1786[0];
                if (r14$1787 === 'line') {
                    var ln$1788 = a0$1765[1];
                    return ln$1788;
                }
            }
        }
    }
    return null;
}
function matchMethodDef$1732(a0$1789) {
    if ((Array.isArray ? Array.isArray(a0$1789) : Object.prototype.toString.call(a0$1789) === '[object Array]') && a0$1789.length >= 5) {
        var r0$1790 = a0$1789[0];
        var r1$1791 = S$1713.unapply(r0$1790);
        if (r1$1791 != null && r1$1791.length === 1) {
            var r2$1792 = r1$1791[0];
            if (r2$1792 === 'method') {
                var r3$1793 = a0$1789[1];
                if ((Array.isArray ? Array.isArray(r3$1793) : Object.prototype.toString.call(r3$1793) === '[object Array]') && r3$1793.length >= 1) {
                    var r4$1794 = r3$1793[0];
                    var r5$1795 = S$1713.unapply(r4$1794);
                    if (r5$1795 != null && r5$1795.length === 1) {
                        var r6$1796 = r5$1795[0];
                        if (r6$1796 === 'attrs') {
                            var r7$1797 = [];
                            var r8$1798 = 1;
                            for (var r9$1799 = 1, r10$1800 = r3$1793.length, r11$1801; r9$1799 < r10$1800; r9$1799++) {
                                r11$1801 = r3$1793[r9$1799];
                                r7$1797[r7$1797.length] = r11$1801;
                            }
                            if (r8$1798) {
                                var r12$1802 = a0$1789[2];
                                var r13$1803 = S$1713.unapply(r12$1802);
                                if (r13$1803 != null && r13$1803.length === 1) {
                                    var r14$1804 = [];
                                    var r15$1805 = 1;
                                    for (var r16$1806 = 5, r17$1807 = a0$1789.length, r18$1808; r16$1806 < r17$1807; r16$1806++) {
                                        r18$1808 = a0$1789[r16$1806];
                                        r14$1804[r14$1804.length] = r18$1808;
                                    }
                                    if (r15$1805) {
                                        var attrs$1809 = r7$1797;
                                        var name$1810 = r13$1803[0];
                                        var params$1811 = a0$1789[3];
                                        var ret$1812 = a0$1789[4];
                                        var body$1813 = r14$1804;
                                        var lines$1814 = [];
                                        var calls$1815 = [];
                                        var stmts$1816 = _$1702.chain(body$1813).map(matchStmt$1728).filter(NOT_NULL$1704).value();
                                        _$1702.forEach(stmts$1816, function (stmt$1818) {
                                            if (typeof stmt$1818 === 'number') {
                                                lines$1814.push(stmt$1818);
                                            } else {
                                                stmt$1818.line = _$1702.last(lines$1814);
                                                calls$1815.push(stmt$1818);
                                            }
                                        });
                                        return {
                                            type: 'method',
                                            name: name$1810,
                                            startLine: lines$1814[0],
                                            endLine: _$1702.last(lines$1814),
                                            attrs: _$1702.map(attrs$1809, S$1713.getSymbolName),
                                            params: _$1702.map(params$1811, matchType$1724),
                                            ret: matchType$1724(ret$1812),
                                            calls: calls$1815
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
function matchClass$1733(a0$1819) {
    if (Array.isArray ? Array.isArray(a0$1819) : Object.prototype.toString.call(a0$1819) === '[object Array]') {
        if (a0$1819.length >= 5) {
            var r0$1820 = a0$1819[0];
            var r1$1821 = S$1713.unapply(r0$1820);
            if (r1$1821 != null && r1$1821.length === 1) {
                var r2$1822 = a0$1819[1];
                if ((Array.isArray ? Array.isArray(r2$1822) : Object.prototype.toString.call(r2$1822) === '[object Array]') && r2$1822.length >= 1) {
                    var r3$1823 = r2$1822[0];
                    var r4$1824 = S$1713.unapply(r3$1823);
                    if (r4$1824 != null && r4$1824.length === 1) {
                        var r5$1825 = r4$1824[0];
                        if (r5$1825 === 'attrs') {
                            var r6$1826 = [];
                            var r7$1827 = 1;
                            for (var r8$1828 = 1, r9$1829 = r2$1822.length, r10$1830; r8$1828 < r9$1829; r8$1828++) {
                                r10$1830 = r2$1822[r8$1828];
                                r6$1826[r6$1826.length] = r10$1830;
                            }
                            if (r7$1827) {
                                var r11$1831 = a0$1819[2];
                                var r12$1832 = S$1713.unapply(r11$1831);
                                if (r12$1832 != null && r12$1832.length === 1) {
                                    var r13$1833 = a0$1819[3];
                                    if ((Array.isArray ? Array.isArray(r13$1833) : Object.prototype.toString.call(r13$1833) === '[object Array]') && r13$1833.length === 2) {
                                        var r14$1834 = r13$1833[0];
                                        var r15$1835 = S$1713.unapply(r14$1834);
                                        if (r15$1835 != null && r15$1835.length === 1) {
                                            var r16$1836 = r15$1835[0];
                                            if (r16$1836 === 'super') {
                                                var r17$1837 = r13$1833[1];
                                                var r18$1838 = S$1713.unapply(r17$1837);
                                                if (r18$1838 != null && r18$1838.length === 1) {
                                                    var r19$1839 = a0$1819[4];
                                                    if ((Array.isArray ? Array.isArray(r19$1839) : Object.prototype.toString.call(r19$1839) === '[object Array]') && r19$1839.length === 2) {
                                                        var r20$1840 = r19$1839[0];
                                                        var r21$1841 = S$1713.unapply(r20$1840);
                                                        if (r21$1841 != null && r21$1841.length === 1) {
                                                            var r22$1842 = r21$1841[0];
                                                            if (r22$1842 === 'source') {
                                                                var r23$1843 = [];
                                                                var r24$1844 = 1;
                                                                for (var r25$1845 = 5, r26$1846 = a0$1819.length, r27$1847; r25$1845 < r26$1846; r25$1845++) {
                                                                    r27$1847 = a0$1819[r25$1845];
                                                                    r23$1843[r23$1843.length] = r27$1847;
                                                                }
                                                                if (r24$1844 && (r1$1821[0] == 'class' || r1$1821[0] == 'interface')) {
                                                                    var type$1848 = r1$1821[0];
                                                                    var attrs$1849 = r6$1826;
                                                                    var path$1850 = r12$1832[0];
                                                                    var parent$1851 = r18$1838[0];
                                                                    var file$1852 = r19$1839[1];
                                                                    var members$1853 = r23$1843;
                                                                    clazz = path$1850.replace(/\//g, '.');
                                                                    parent$1851 = parent$1851.replace(/\//g, '.');
                                                                    filename = path$1850.split('$')[0];
                                                                    return {
                                                                        type: type$1848,
                                                                        file: filename,
                                                                        name: clazz,
                                                                        parent: parent$1851,
                                                                        attrs: _$1702.map(attrs$1849, S$1713.getSymbolName),
                                                                        methods: _$1702.chain(members$1853).map(matchMethodDef$1732).filter(NOT_NULL$1704).map(function (m$1855) {
                                                                            m$1855.clazz = clazz;
                                                                            m$1855.filename = filename;
                                                                            return m$1855;
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
        if (a0$1819.length >= 4) {
            var r28$1856 = a0$1819[0];
            var r29$1857 = S$1713.unapply(r28$1856);
            if (r29$1857 != null && r29$1857.length === 1) {
                var r30$1858 = a0$1819[1];
                if ((Array.isArray ? Array.isArray(r30$1858) : Object.prototype.toString.call(r30$1858) === '[object Array]') && r30$1858.length >= 1) {
                    var r31$1859 = r30$1858[0];
                    var r32$1860 = S$1713.unapply(r31$1859);
                    if (r32$1860 != null && r32$1860.length === 1) {
                        var r33$1861 = r32$1860[0];
                        if (r33$1861 === 'attrs') {
                            var r34$1862 = [];
                            var r35$1863 = 1;
                            for (var r36$1864 = 1, r37$1865 = r30$1858.length, r38$1866; r36$1864 < r37$1865; r36$1864++) {
                                r38$1866 = r30$1858[r36$1864];
                                r34$1862[r34$1862.length] = r38$1866;
                            }
                            if (r35$1863) {
                                var r39$1867 = a0$1819[2];
                                var r40$1868 = S$1713.unapply(r39$1867);
                                if (r40$1868 != null && r40$1868.length === 1) {
                                    var r41$1869 = a0$1819[3];
                                    if ((Array.isArray ? Array.isArray(r41$1869) : Object.prototype.toString.call(r41$1869) === '[object Array]') && r41$1869.length === 2) {
                                        var r42$1870 = r41$1869[0];
                                        var r43$1871 = S$1713.unapply(r42$1870);
                                        if (r43$1871 != null && r43$1871.length === 1) {
                                            var r44$1872 = r43$1871[0];
                                            if (r44$1872 === 'super') {
                                                var r45$1873 = r41$1869[1];
                                                var r46$1874 = S$1713.unapply(r45$1873);
                                                if (r46$1874 != null && r46$1874.length === 1) {
                                                    var r47$1875 = [];
                                                    var r48$1876 = 1;
                                                    for (var r49$1877 = 4, r50$1878 = a0$1819.length, r51$1879; r49$1877 < r50$1878; r49$1877++) {
                                                        r51$1879 = a0$1819[r49$1877];
                                                        r47$1875[r47$1875.length] = r51$1879;
                                                    }
                                                    if (r48$1876 && (r29$1857[0] == 'class' || r29$1857[0] == 'interface')) {
                                                        var type$1848 = r29$1857[0];
                                                        var attrs$1849 = r34$1862;
                                                        var path$1850 = r40$1868[0];
                                                        var parent$1851 = r46$1874[0];
                                                        var members$1853 = r47$1875;
                                                        clazz = path$1850.replace(/\//g, '.');
                                                        parent$1851 = parent$1851.replace(/\//g, '.');
                                                        return {
                                                            type: type$1848,
                                                            name: clazz,
                                                            parent: parent$1851,
                                                            attrs: _$1702.map(attrs$1849, S$1713.getSymbolName),
                                                            methods: _$1702.chain(members$1853).map(matchMethodDef$1732).filter(NOT_NULL$1704).map(function (m$1881) {
                                                                m$1881.clazz = clazz;
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
    return null;
}
module.exports = {
    matchClass: matchClass$1733,
    matchPathNode: matchPathNode$1720,
    NOT_NULL: NOT_NULL$1704,
    NOT_EMPTY: NOT_EMPTY$1706,
    getMethodSignature: getMethodSignature$1709
};
