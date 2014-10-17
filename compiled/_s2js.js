var fs$1696 = require('fs'), parse$1697 = require('sexpression').parse, _$1698 = require('lodash');
var NOT_NULL$1700 = function (m$1735) {
    return !!m$1735;
};
/* extracts a javascript encoded symbol for pattern matching */
var S$1701 = {
        getSymbolName: function (a0$1741) {
            if (a0$1741 != null) {
                var r0$1742 = Object(a0$1741);
                if (':' in r0$1742) {
                    var name$1743 = r0$1742[':'];
                    return name$1743;
                }
            }
            return null;
        },
        hasInstance: function (x$1744) {
            return !!S$1701.getSymbolName(x$1744);
        },
        unapply: function (x$1745) {
            var name$1746 = S$1701.getSymbolName(x$1745);
            if (name$1746) {
                return [name$1746];
            }
        }
    };
function matchType$1708(a0$1747) {
    if ((Array.isArray ? Array.isArray(a0$1747) : Object.prototype.toString.call(a0$1747) === '[object Array]') && a0$1747.length === 2) {
        var r0$1749 = a0$1747[0];
        var r1$1750 = S$1701.unapply(r0$1749);
        if (r1$1750 != null && r1$1750.length === 1) {
            var r2$1751 = r1$1750[0];
            if (r2$1751 === 'array') {
                var type$1752 = a0$1747[1];
                return [matchType$1708(type$1752)];
            }
            if (r2$1751 === 'object') {
                var r3$1753 = a0$1747[1];
                var r4$1754 = S$1701.unapply(r3$1753);
                if (r4$1754 != null && r4$1754.length === 1) {
                    var className$1755 = r4$1754[0];
                    return className$1755;
                }
            }
        }
    }
    var r5$1748 = S$1701.unapply(a0$1747);
    if (r5$1748 != null && r5$1748.length === 1) {
        var prim$1756 = r5$1748[0];
        return prim$1756;
    }
    throw new TypeError('No match');
}
function matchStmt$1712(a0$1757) {
    if (Array.isArray ? Array.isArray(a0$1757) : Object.prototype.toString.call(a0$1757) === '[object Array]') {
        if (a0$1757.length === 5) {
            var r0$1758 = a0$1757[0];
            var r1$1759 = S$1701.unapply(r0$1758);
            if (r1$1759 != null && r1$1759.length === 1) {
                var r2$1760 = a0$1757[2];
                var r3$1761 = S$1701.unapply(r2$1760);
                if (r3$1761 != null && (r3$1761.length === 1 && !r1$1759[0].indexOf('invoke'))) {
                    var type$1762 = r1$1759[0];
                    var regs$1763 = a0$1757[1];
                    var name$1764 = r3$1761[0];
                    var params$1765 = a0$1757[3];
                    var ret$1766 = a0$1757[4];
                    var invoke$1767 = {
                            type: type$1762,
                            name: name$1764,
                            params: _$1698.map(params$1765, matchType$1708),
                            ret: matchType$1708(ret$1766)
                        };
                    invoke$1767.signature = getMethodSigFromInvoke$1724(invoke$1767);
                    return invoke$1767;
                }
            }
        }
        if (a0$1757.length === 2) {
            var r4$1768 = a0$1757[0];
            var r5$1769 = S$1701.unapply(r4$1768);
            if (r5$1769 != null && r5$1769.length === 1) {
                var r6$1770 = r5$1769[0];
                if (r6$1770 === 'line') {
                    var ln$1771 = a0$1757[1];
                    return ln$1771;
                }
            }
        }
    }
    return null;
}
function matchMethodDef$1716(a0$1772) {
    if ((Array.isArray ? Array.isArray(a0$1772) : Object.prototype.toString.call(a0$1772) === '[object Array]') && a0$1772.length >= 5) {
        var r0$1773 = a0$1772[0];
        var r1$1774 = S$1701.unapply(r0$1773);
        if (r1$1774 != null && r1$1774.length === 1) {
            var r2$1775 = r1$1774[0];
            if (r2$1775 === 'method') {
                var r3$1776 = a0$1772[1];
                if ((Array.isArray ? Array.isArray(r3$1776) : Object.prototype.toString.call(r3$1776) === '[object Array]') && r3$1776.length >= 1) {
                    var r4$1777 = r3$1776[0];
                    var r5$1778 = S$1701.unapply(r4$1777);
                    if (r5$1778 != null && r5$1778.length === 1) {
                        var r6$1779 = r5$1778[0];
                        if (r6$1779 === 'attrs') {
                            var r7$1780 = [];
                            var r8$1781 = 1;
                            for (var r9$1782 = 1, r10$1783 = r3$1776.length, r11$1784; r9$1782 < r10$1783; r9$1782++) {
                                r11$1784 = r3$1776[r9$1782];
                                r7$1780[r7$1780.length] = r11$1784;
                            }
                            if (r8$1781) {
                                var r12$1785 = a0$1772[2];
                                var r13$1786 = S$1701.unapply(r12$1785);
                                if (r13$1786 != null && r13$1786.length === 1) {
                                    var r14$1787 = [];
                                    var r15$1788 = 1;
                                    for (var r16$1789 = 5, r17$1790 = a0$1772.length, r18$1791; r16$1789 < r17$1790; r16$1789++) {
                                        r18$1791 = a0$1772[r16$1789];
                                        r14$1787[r14$1787.length] = r18$1791;
                                    }
                                    if (r15$1788) {
                                        var attrs$1792 = r7$1780;
                                        var name$1793 = r13$1786[0];
                                        var params$1794 = a0$1772[3];
                                        var ret$1795 = a0$1772[4];
                                        var body$1796 = r14$1787;
                                        var lines$1797 = [];
                                        var calls$1798 = [];
                                        var stmts$1799 = _$1698.chain(body$1796).map(matchStmt$1712).filter(NOT_NULL$1700).value();
                                        _$1698.forEach(stmts$1799, function (stmt$1801) {
                                            if (typeof stmt$1801 === 'number') {
                                                lines$1797.push(stmt$1801);
                                            } else {
                                                stmt$1801.line = _$1698.last(lines$1797);
                                                calls$1798.push(stmt$1801);
                                            }
                                        });
                                        return {
                                            type: 'method',
                                            name: name$1793,
                                            startLine: lines$1797[0],
                                            endLine: _$1698.last(lines$1797),
                                            attrs: _$1698.map(attrs$1792, S$1701.getSymbolName),
                                            params: _$1698.map(params$1794, matchType$1708),
                                            ret: matchType$1708(ret$1795),
                                            calls: calls$1798
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
function matchClass$1717(a0$1802) {
    if ((Array.isArray ? Array.isArray(a0$1802) : Object.prototype.toString.call(a0$1802) === '[object Array]') && a0$1802.length >= 5) {
        var r0$1803 = a0$1802[0];
        var r1$1804 = S$1701.unapply(r0$1803);
        if (r1$1804 != null && r1$1804.length === 1) {
            var r2$1805 = a0$1802[1];
            if ((Array.isArray ? Array.isArray(r2$1805) : Object.prototype.toString.call(r2$1805) === '[object Array]') && r2$1805.length >= 1) {
                var r3$1806 = r2$1805[0];
                var r4$1807 = S$1701.unapply(r3$1806);
                if (r4$1807 != null && r4$1807.length === 1) {
                    var r5$1808 = r4$1807[0];
                    if (r5$1808 === 'attrs') {
                        var r6$1809 = [];
                        var r7$1810 = 1;
                        for (var r8$1811 = 1, r9$1812 = r2$1805.length, r10$1813; r8$1811 < r9$1812; r8$1811++) {
                            r10$1813 = r2$1805[r8$1811];
                            r6$1809[r6$1809.length] = r10$1813;
                        }
                        if (r7$1810) {
                            var r11$1814 = a0$1802[2];
                            var r12$1815 = S$1701.unapply(r11$1814);
                            if (r12$1815 != null && r12$1815.length === 1) {
                                var r13$1816 = a0$1802[3];
                                if ((Array.isArray ? Array.isArray(r13$1816) : Object.prototype.toString.call(r13$1816) === '[object Array]') && r13$1816.length === 2) {
                                    var r14$1817 = r13$1816[0];
                                    var r15$1818 = S$1701.unapply(r14$1817);
                                    if (r15$1818 != null && r15$1818.length === 1) {
                                        var r16$1819 = r15$1818[0];
                                        if (r16$1819 === 'super') {
                                            var r17$1820 = r13$1816[1];
                                            var r18$1821 = S$1701.unapply(r17$1820);
                                            if (r18$1821 != null && r18$1821.length === 1) {
                                                var r19$1822 = a0$1802[4];
                                                if ((Array.isArray ? Array.isArray(r19$1822) : Object.prototype.toString.call(r19$1822) === '[object Array]') && r19$1822.length === 2) {
                                                    var r20$1823 = r19$1822[0];
                                                    var r21$1824 = S$1701.unapply(r20$1823);
                                                    if (r21$1824 != null && r21$1824.length === 1) {
                                                        var r22$1825 = r21$1824[0];
                                                        if (r22$1825 === 'source') {
                                                            var r23$1826 = [];
                                                            var r24$1827 = 1;
                                                            for (var r25$1828 = 5, r26$1829 = a0$1802.length, r27$1830; r25$1828 < r26$1829; r25$1828++) {
                                                                r27$1830 = a0$1802[r25$1828];
                                                                r23$1826[r23$1826.length] = r27$1830;
                                                            }
                                                            if (r24$1827 && (r1$1804[0] === 'class' || r1$1804[0] == 'interface')) {
                                                                var type$1831 = r1$1804[0];
                                                                var attrs$1832 = r6$1809;
                                                                var clazz$1833 = r12$1815[0];
                                                                var parent$1834 = r18$1821[0];
                                                                var file$1835 = r19$1822[1];
                                                                var members$1836 = r23$1826;
                                                                return {
                                                                    type: type$1831,
                                                                    file: file$1835,
                                                                    name: clazz$1833,
                                                                    parent: parent$1834,
                                                                    attrs: _$1698.map(attrs$1832, S$1701.getSymbolName),
                                                                    methods: _$1698.chain(members$1836).map(matchMethodDef$1716).filter(NOT_NULL$1700).map(function (m$1838) {
                                                                        m$1838.clazz = clazz$1833;
                                                                        m$1838.file = file$1835;
                                                                        return m$1838;
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
var onFilesDone$1720 = function (classes$1839, onComplete$1840) {
    var methods$1841 = {};
    var outClasses$1842 = {};
    _$1698.forEach(classes$1839, function (clazz$1845) {
        outClasses$1842[clazz$1845.name] = {
            file: clazz$1845.file,
            name: clazz$1845.clazz,
            parent: clazz$1845.parent,
            attrs: clazz$1845.attrs,
            methods: []
        };
        _$1698.forEach(clazz$1845.methods, function (method$1847) {
            var sig$1848 = getMethodSig$1722(method$1847);
            methods$1841[sig$1848] = method$1847;
            outClasses$1842[clazz$1845.name].methods.push(sig$1848);
        });
    });
    readSourcesAndSinks$1733(function (sources$1849, sinks$1850) {
        _$1698.forEach(methods$1841, function (m$1852) {
            _$1698.forEach(m$1852.calls, function (invoke$1854) {
                if (invoke$1854.signature in sources$1849) {
                    if (!m$1852.risks)
                        m$1852.risks = [];
                    invoke$1854.isSource = true;
                    invoke$1854.category = sources$1849[invoke$1854.signature].category;
                    m$1852.risks.push(invoke$1854);
                }
                if (invoke$1854.signature in sinks$1850) {
                    if (!m$1852.risks)
                        m$1852.risks = [];
                    invoke$1854.isSink = true;
                    invoke$1854.category = sinks$1850[invoke$1854.signature].category;
                    m$1852.risks.push(invoke$1854);
                }
            });
        });
        onComplete$1840({
            classes: outClasses$1842,
            methods: methods$1841
        });
    });
};
function getMethodSig$1722(m$1855) {
    /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
    return [
        m$1855.clazz.replace(/\//g, '.'),
        m$1855.name
    ].join('.') + '(' + m$1855.params.join(',') + ') => ' + m$1855.ret;
}
function getMethodSigFromInvoke$1724(m$1856) {
    return m$1856.name.replace(/\//g, '.') + '(' + m$1856.params.join(',') + ') => ' + m$1856.ret;
}
function processFiles$1725(files$1857, classes$1858, onComplete$1859) {
    if (!classes$1858)
        classes$1858 = {};
    if (files$1857.length) {
        console.log(_$1698.last(files$1857));
        fs$1696.readFile(files$1857.pop(), { encoding: 'utf-8' }, function (err$1861, data$1862) {
            var clazz$1863 = matchClass$1717(parse$1697(data$1862));
            classes$1858[clazz$1863.name] = clazz$1863;
            processFiles$1725(files$1857, classes$1858, onComplete$1859);
        });
    } else {
        onFilesDone$1720(classes$1858, onComplete$1859);
    }
}
var NOT_EMPTY$1727 = function (m$1864) {
    return m$1864 != '';
};
function parseSourceSinkLine$1730(ln$1865) {
    var m$1866 = /\s*<([^:]*):\s(\S+)\s(\S+)\(([^)]*)\)>\s*\(([^)]+)\)\s*/.exec(ln$1865);
    if (m$1866) {
        m$1866 = m$1866.slice(1);
        // matched groups 
        return {
            clazz: m$1866[0],
            ret: m$1866[1],
            name: m$1866[2],
            params: _$1698.filter(m$1866[3].split(','), NOT_EMPTY$1727),
            category: m$1866[4] == 'NO_CATEGORY' ? 'SYSTEM' : m$1866[4]
        };
    }
}
function parseSourceSinkList$1732(path$1867, onComplete$1868) {
    fs$1696.readFile(path$1867, { encoding: 'utf-8' }, function (err$1870, data$1871) {
        if (!!err$1870)
            throw err$1870;
        var lines$1872 = data$1871.split('\n');
        var parsed$1873 = _$1698.chain(lines$1872).map(parseSourceSinkLine$1730).filter(NOT_NULL$1700).value();
        onComplete$1868(parsed$1873);
    });
}
function readSourcesAndSinks$1733(onComplete$1874) {
    parseSourceSinkList$1732('data/sources_list', function (sources$1876) {
        parseSourceSinkList$1732('data/sinks_list', function (sinks$1878) {
            var outSources$1879 = {};
            var outSinks$1880 = {};
            _$1698.forEach(sources$1876, function (src$1883) {
                outSources$1879[getMethodSig$1722(src$1883)] = src$1883;
            });
            _$1698.forEach(sinks$1878, function (sink$1884) {
                outSinks$1880[getMethodSig$1722(sink$1884)] = sink$1884;
            });
            onComplete$1874(outSources$1879, outSinks$1880);
        });
    });
}
exports.getCallGraph = function (path$1885, onComplete$1886) {
    fs$1696.readdir(path$1885, function (err$1888, files$1889) {
        processFiles$1725(_$1698.map(files$1889, function (f$1891) {
            return path$1885 + f$1891;
        }), null, onComplete$1886);
    });
};
