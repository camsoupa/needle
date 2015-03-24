var _$1702 = require('lodash');
var NOT_NULL$1704 = function (m$1736) {
    return !!m$1736;
};
var NOT_EMPTY$1706 = function (m$1737) {
    return m$1737 != '';
};
function getMethodSignature$1709(m$1738) {
    return [
        /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
        m$1738.clazz,
        m$1738.name
    ].join('.') + '(' + m$1738.params.join(',') + ') => ' + m$1738.ret;
}
function getMethodSigFromInvoke$1711(m$1739) {
    return m$1739.name + '(' + m$1739.params.join(',') + ') => ' + m$1739.ret;
}
function class2Filename$1712(className$1740) {
    return className$1740.split('$')[0].replace(/\./g, '/');
}
var S$1713 = {
    /* extracts a javascript encoded symbol for pattern matching */
    getSymbolName: function (a0$1746) {
        if (a0$1746 != null) {
            var r0$1747 = Object(a0$1746);
            if (':' in r0$1747) {
                var name$1748 = r0$1747[':'];
                return name$1748;
            }
        }
        return null;
    },
    hasInstance: function (x$1749) {
        return !!S$1713.getSymbolName(x$1749);
    },
    unapply: function (x$1750) {
        var name$1751 = S$1713.getSymbolName(x$1750);
        if (name$1751) {
            return [name$1751];
        }
    }
};
function matchPathNode$1720(a0$1752) {
    if ((Array.isArray ? Array.isArray(a0$1752) : Object.prototype.toString.call(a0$1752) === '[object Array]') && a0$1752.length === 3) {
        var className$1754 = a0$1752[0];
        var stmt$1755 = a0$1752[1];
        var ln$1756 = a0$1752[2];
        return {
            className: className$1754,
            filename: class2Filename$1712(className$1754),
            stmt: stmt$1755,
            line: ln$1756
        };
    }
    var x$1753 = a0$1752;
    console.log(x$1753);
    throw 'matchPathNode failed!';
    return;
}
function matchType$1724(a0$1757) {
    if ((/** Matches .sxddx files */
        Array.isArray ? Array.isArray(a0$1757) : Object.prototype.toString.call(a0$1757) === '[object Array]') && a0$1757.length === 2) {
        var r0$1759 = a0$1757[0];
        var r1$1760 = S$1713.unapply(r0$1759);
        if (r1$1760 != null && r1$1760.length === 1) {
            var r2$1761 = r1$1760[0];
            if (r2$1761 === 'array') {
                var type$1762 = a0$1757[1];
                return [matchType$1724(type$1762)];
            }
            if (r2$1761 === 'object') {
                var r3$1763 = a0$1757[1];
                var r4$1764 = S$1713.unapply(r3$1763);
                if (r4$1764 != null && r4$1764.length === 1) {
                    var className$1765 = r4$1764[0];
                    return className$1765.replace(/\//g, '.');
                }
            }
        }
    }
    var r5$1758 = S$1713.unapply(a0$1757);
    if (r5$1758 != null && r5$1758.length === 1) {
        var prim$1766 = r5$1758[0];
        return prim$1766;
    }
    throw new TypeError('No match');
}
function matchStmt$1728(a0$1767) {
    if (Array.isArray ? Array.isArray(a0$1767) : Object.prototype.toString.call(a0$1767) === '[object Array]') {
        if (a0$1767.length === 5) {
            var r0$1768 = a0$1767[0];
            var r1$1769 = S$1713.unapply(r0$1768);
            if (r1$1769 != null && r1$1769.length === 1) {
                var r2$1770 = a0$1767[2];
                var r3$1771 = S$1713.unapply(r2$1770);
                if (r3$1771 != null && (r3$1771.length === 1 && !r1$1769[0].indexOf('invoke'))) {
                    var type$1772 = r1$1769[0];
                    var regs$1773 = a0$1767[1];
                    var name$1774 = r3$1771[0];
                    var params$1775 = a0$1767[3];
                    var ret$1776 = a0$1767[4];
                    var invoke$1777 = {
                        type: type$1772,
                        name: name$1774.replace(/\//g, '.'),
                        params: _$1702.map(params$1775, matchType$1724),
                        ret: matchType$1724(ret$1776)
                    };
                    invoke$1777.signature = getMethodSigFromInvoke$1711(invoke$1777);
                    return invoke$1777;
                }
            }
        }
        if (a0$1767.length === 6) {
            var r4$1778 = a0$1767[0];
            var r5$1779 = S$1713.unapply(r4$1778);
            if (r5$1779 != null && r5$1779.length === 1) {
                var r6$1780 = a0$1767[2];
                if ((Array.isArray ? Array.isArray(r6$1780) : Object.prototype.toString.call(r6$1780) === '[object Array]') && r6$1780.length === 2) {
                    var r7$1781 = r6$1780[0];
                    var r8$1782 = S$1713.unapply(r7$1781);
                    if (r8$1782 != null && r8$1782.length === 1) {
                        var r9$1783 = r8$1782[0];
                        if (r9$1783 === 'array') {
                            var r10$1784 = a0$1767[3];
                            var r11$1785 = S$1713.unapply(r10$1784);
                            if (r11$1785 != null && r11$1785.length === 1) {
                                var type$1772 = r5$1779[0];
                                var regs$1773 = a0$1767[1];
                                var array_type$1786 = r6$1780[1];
                                var name$1774 = r11$1785[0];
                                var params$1775 = a0$1767[4];
                                var ret$1776 = a0$1767[5];
                                var invoke$1777 = {
                                    type: type$1772,
                                    name: matchType$1724(array_type$1786) + '[]' + name$1774.replace(/\//g, '.'),
                                    params: _$1702.map(params$1775, matchType$1724),
                                    ret: matchType$1724(ret$1776)
                                };
                                invoke$1777.signature = getMethodSigFromInvoke$1711(invoke$1777);
                                return invoke$1777;
                            }
                        }
                    }
                }
            }
        }
        if (a0$1767.length === 2) {
            var r12$1787 = a0$1767[0];
            var r13$1788 = S$1713.unapply(r12$1787);
            if (r13$1788 != null && r13$1788.length === 1) {
                var r14$1789 = r13$1788[0];
                if (r14$1789 === 'line') {
                    var ln$1790 = a0$1767[1];
                    return ln$1790;
                }
            }
        }
    }
    return null;
}
function matchMethodDef$1730(a0$1791) {
    if ((Array.isArray ? Array.isArray(a0$1791) : Object.prototype.toString.call(a0$1791) === '[object Array]') && a0$1791.length >= 5) {
        var r0$1792 = a0$1791[0];
        var r1$1793 = S$1713.unapply(r0$1792);
        if (r1$1793 != null && r1$1793.length === 1) {
            var r2$1794 = r1$1793[0];
            if (r2$1794 === 'method') {
                var r3$1795 = a0$1791[1];
                if ((Array.isArray ? Array.isArray(r3$1795) : Object.prototype.toString.call(r3$1795) === '[object Array]') && r3$1795.length >= 1) {
                    var r4$1796 = r3$1795[0];
                    var r5$1797 = S$1713.unapply(r4$1796);
                    if (r5$1797 != null && r5$1797.length === 1) {
                        var r6$1798 = r5$1797[0];
                        if (r6$1798 === 'attrs') {
                            var r7$1799 = [];
                            var r8$1800 = 1;
                            for (var r9$1801 = 1, r10$1802 = r3$1795.length, r11$1803; r9$1801 < r10$1802; r9$1801++) {
                                r11$1803 = r3$1795[r9$1801];
                                r7$1799[r7$1799.length] = r11$1803;
                            }
                            if (r8$1800) {
                                var r12$1804 = a0$1791[2];
                                var r13$1805 = S$1713.unapply(r12$1804);
                                if (r13$1805 != null && r13$1805.length === 1) {
                                    var r14$1806 = [];
                                    var r15$1807 = 1;
                                    for (var r16$1808 = 5, r17$1809 = a0$1791.length, r18$1810; r16$1808 < r17$1809; r16$1808++) {
                                        r18$1810 = a0$1791[r16$1808];
                                        r14$1806[r14$1806.length] = r18$1810;
                                    }
                                    if (r15$1807) {
                                        var attrs$1811 = r7$1799;
                                        var name$1812 = r13$1805[0];
                                        var params$1813 = a0$1791[3];
                                        var ret$1814 = a0$1791[4];
                                        var body$1815 = r14$1806;
                                        var lines$1816 = [];
                                        var calls$1817 = [];
                                        var stmts$1818 = _$1702.chain(body$1815).map(matchStmt$1728).filter(NOT_NULL$1704).value();
                                        _$1702.forEach(stmts$1818, function (stmt$1820) {
                                            if (typeof stmt$1820 === 'number') {
                                                lines$1816.push(stmt$1820);
                                            } else {
                                                stmt$1820.line = _$1702.last(lines$1816);
                                                calls$1817.push(stmt$1820);
                                            }
                                        });
                                        return {
                                            type: 'method',
                                            name: name$1812,
                                            startLine: lines$1816[0],
                                            endLine: _$1702.last(lines$1816),
                                            attrs: _$1702.map(attrs$1811, S$1713.getSymbolName),
                                            params: _$1702.map(params$1813, matchType$1724),
                                            ret: matchType$1724(ret$1814),
                                            calls: calls$1817
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
function buildClass$1734(type$1821, attrs$1822, path$1823, filename$1824, parent$1825, members$1826) {
    var clazz$1827 = path$1823.replace(/\//g, '.');
    var parent$1825 = parent$1825.replace(/\//g, '.');
    return {
        type: type$1821,
        file: filename$1824,
        name: clazz$1827,
        parent: parent$1825,
        attrs: _$1702.map(attrs$1822, S$1713.getSymbolName),
        methods: _$1702.chain(members$1826).map(matchMethodDef$1730).filter(NOT_NULL$1704).map(function (m$1829) {
            m$1829.clazz = clazz$1827;
            m$1829.filename = filename$1824;
            return m$1829;
        }).value()
    };
}
function matchClass$1735(a0$1830) {
    if (Array.isArray ? Array.isArray(a0$1830) : Object.prototype.toString.call(a0$1830) === '[object Array]') {
        if (a0$1830.length >= 5) {
            var r0$1831 = a0$1830[0];
            var r1$1832 = S$1713.unapply(r0$1831);
            if (r1$1832 != null && r1$1832.length === 1) {
                var r2$1833 = a0$1830[1];
                if ((Array.isArray ? Array.isArray(r2$1833) : Object.prototype.toString.call(r2$1833) === '[object Array]') && r2$1833.length >= 1) {
                    var r3$1834 = r2$1833[0];
                    var r4$1835 = S$1713.unapply(r3$1834);
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
                                var r12$1843 = S$1713.unapply(r11$1842);
                                if (r12$1843 != null && r12$1843.length === 1) {
                                    var r13$1844 = a0$1830[3];
                                    if ((Array.isArray ? Array.isArray(r13$1844) : Object.prototype.toString.call(r13$1844) === '[object Array]') && r13$1844.length === 2) {
                                        var r14$1845 = r13$1844[0];
                                        var r15$1846 = S$1713.unapply(r14$1845);
                                        if (r15$1846 != null && r15$1846.length === 1) {
                                            var r16$1847 = r15$1846[0];
                                            if (r16$1847 === 'super') {
                                                var r17$1848 = r13$1844[1];
                                                var r18$1849 = S$1713.unapply(r17$1848);
                                                if (r18$1849 != null && r18$1849.length === 1) {
                                                    var r19$1850 = a0$1830[4];
                                                    if ((Array.isArray ? Array.isArray(r19$1850) : Object.prototype.toString.call(r19$1850) === '[object Array]') && r19$1850.length === 2) {
                                                        var r20$1851 = r19$1850[0];
                                                        var r21$1852 = S$1713.unapply(r20$1851);
                                                        if (r21$1852 != null && r21$1852.length === 1) {
                                                            var r22$1853 = r21$1852[0];
                                                            if (r22$1853 === 'source') {
                                                                var r23$1854 = [];
                                                                var r24$1855 = 1;
                                                                for (var r25$1856 = 5, r26$1857 = a0$1830.length, r27$1858; r25$1856 < r26$1857; r25$1856++) {
                                                                    r27$1858 = a0$1830[r25$1856];
                                                                    r23$1854[r23$1854.length] = r27$1858;
                                                                }
                                                                if (r24$1855 && (r1$1832[0] == 'class' || r1$1832[0] == 'interface')) {
                                                                    var type$1859 = r1$1832[0];
                                                                    var attrs$1860 = r6$1837;
                                                                    var path$1861 = r12$1843[0];
                                                                    var parent$1862 = r18$1849[0];
                                                                    var file$1863 = r19$1850[1];
                                                                    var members$1864 = r23$1854;
                                                                    return buildClass$1734(type$1859, attrs$1860, path$1861, path$1861.split('$')[0], parent$1862, members$1864);
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
        if (a0$1830.length >= 4) {
            var r28$1865 = a0$1830[0];
            var r29$1866 = S$1713.unapply(r28$1865);
            if (r29$1866 != null && r29$1866.length === 1) {
                var r30$1867 = a0$1830[1];
                if ((Array.isArray ? Array.isArray(r30$1867) : Object.prototype.toString.call(r30$1867) === '[object Array]') && r30$1867.length >= 1) {
                    var r31$1868 = r30$1867[0];
                    var r32$1869 = S$1713.unapply(r31$1868);
                    if (r32$1869 != null && r32$1869.length === 1) {
                        var r33$1870 = r32$1869[0];
                        if (r33$1870 === 'attrs') {
                            var r34$1871 = [];
                            var r35$1872 = 1;
                            for (var r36$1873 = 1, r37$1874 = r30$1867.length, r38$1875; r36$1873 < r37$1874; r36$1873++) {
                                r38$1875 = r30$1867[r36$1873];
                                r34$1871[r34$1871.length] = r38$1875;
                            }
                            if (r35$1872) {
                                var r39$1876 = a0$1830[2];
                                var r40$1877 = S$1713.unapply(r39$1876);
                                if (r40$1877 != null && r40$1877.length === 1) {
                                    var r41$1878 = a0$1830[3];
                                    if ((Array.isArray ? Array.isArray(r41$1878) : Object.prototype.toString.call(r41$1878) === '[object Array]') && r41$1878.length === 2) {
                                        var r42$1879 = r41$1878[0];
                                        var r43$1880 = S$1713.unapply(r42$1879);
                                        if (r43$1880 != null && r43$1880.length === 1) {
                                            var r44$1881 = r43$1880[0];
                                            if (r44$1881 === 'super') {
                                                var r45$1882 = r41$1878[1];
                                                var r46$1883 = S$1713.unapply(r45$1882);
                                                if (r46$1883 != null && r46$1883.length === 1) {
                                                    var r47$1884 = [];
                                                    var r48$1885 = 1;
                                                    for (var r49$1886 = 4, r50$1887 = a0$1830.length, r51$1888; r49$1886 < r50$1887; r49$1886++) {
                                                        r51$1888 = a0$1830[r49$1886];
                                                        r47$1884[r47$1884.length] = r51$1888;
                                                    }
                                                    if (r48$1885 && (r29$1866[0] == 'class' || r29$1866[0] == 'interface')) {
                                                        var type$1859 = r29$1866[0];
                                                        var attrs$1860 = r34$1871;
                                                        var path$1861 = r40$1877[0];
                                                        var parent$1862 = r46$1883[0];
                                                        var members$1864 = r47$1884;
                                                        return buildClass$1734(type$1859, attrs$1860, '/_no_source/' + path$1861, '/_no_source/' + path$1861, parent$1862, members$1864);
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
    matchClass: matchClass$1735,
    matchPathNode: matchPathNode$1720,
    NOT_NULL: NOT_NULL$1704,
    NOT_EMPTY: NOT_EMPTY$1706,
    getMethodSignature: getMethodSignature$1709
};
