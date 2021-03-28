!function e(t, n, o) {
    function r(a, u) {
        if (!n[a]) {
            if (!t[a]) {
                var c = "function" == typeof require && require;
                if (!u && c) 
                    return c(a, !0);
                if (i) 
                    return i(a, !0);
                var s = new Error("Cannot find module '" + a + "'");
                throw s.code = "MODULE_NOT_FOUND",
                s
            }
            var l = n[a] = {
                exports: {}
            };
            t[a][0].call(l.exports, function (e) {
                var n = t[a][1][e];
                return r(n || e)
            }, l, l.exports, e, t, n, o)
        }
        return n[a].exports
    }
    for (var i = "function" == typeof require && require, a = 0; a < o.length; a++) 
        r(o[a]);
    return r
}({
    1: [
        function (e, t, n) {
            "use strict";
            function o(e) {
                return /[ \f\n\r\t\v\u00A0\u2028\u2029]/.test(e)
            }
            function r(e) {
                return /[\^\$\!\@\#\%\&\*\-\_\=\+\,\.\:\/\;\"\'\(\)\[\]\{\<\>}]/.test(e)
            }
            function i(e) {
                return !e || /^(BR|DIV|P|PRE|TD|TR|TABLE)$/i.test(e.nodeName)
            }
            function a(e) {
                var t = null;
                return e.nextSibling
                    ? t = e.nextSibling
                    : e.parentNode && e.parentNode.nextSibling && (t = e.parentNode.nextSibling),
                i(t)
                    ? null
                    : t
            }
            function u(e) {
                var t = null;
                return e.previousSibling
                    ? t = e.previousSibling
                    : e.parentNode && e.parentNode.previousSibling && (
                        t = e.parentNode.previousSibling
                    ),
                i(t)
                    ? null
                    : t
            }
            function c(e) {
                for (var t = 0; e = e.previousSibling;) 
                    t++;
                return t
            }
            function s(e, t) {
                var n = e.duplicate();
                n.collapse(t);
                var o,
                    r,
                    i,
                    a = n.parentElement(),
                    u = document.createElement("span"),
                    s = t
                        ? "StartToStart"
                        : "StartToEnd";
                do {
                    a.insertBefore(u, u.previousSibling),
                    n.moveToElementText(u)
                } while ((o = n.compareEndPoints(s, e)) > 0 && u.previousSibling);
                return i = u.nextSibling,
                -1 == o && i
                    ? (n.setEndPoint(
                        t
                            ? "EndToStart"
                            : "EndToEnd",
                        e
                    ), r = {
                        node: i,
                        offset: n.text.length
                    })
                    : r = {
                        node: a,
                        offset: c(u)
                    },
                u
                    .parentNode
                    .removeChild(u),
                r
            }
            Object.defineProperty(n, "__esModule", {
                value: !0
            }),
            n.default = function (e) {
                var t,
                    n,
                    i,
                    c,
                    l,
                    d;
                if (document.body.createTextRange) 
                    try {
                        (c = document.body.createTextRange()).moveToPoint(e.x, e.y),
                        c.select(),
                        l = (c = s(c, !0)).node,
                        d = c.offset
                    } catch (e) {
                        return ""
                    }
                else if (document.caretPositionFromPoint) {
                    if (!(c = document.caretPositionFromPoint(e.x, e.y))) 
                        return "";
                    l = c.offsetNode,
                    d = c.offset
                } else 
                    document.caretRangeFromPoint && (
                        l = (c = document.caretRangeFromPoint(e.x, e.y) || new Range).startContainer,
                        d = c.startOffset
                    );
                if (!l || l.nodeType !== Node.TEXT_NODE) 
                    return "";
                var f = l.textContent;
                if (d <= 0 || d >= f.length) 
                    return "";
                if (o(f[d]) || r(f[d])) 
                    return "";
                for (t = n = i = d; t > 0 && !o(f[t - 1]) && !r(f[t - 1]);) 
                    t--;
                for (n = t, t = d; t < f.length - 1 && !o(f[t + 1]) && !r(f[t + 1]);) 
                    t++;
                i = t;
                var p = f.substring(n, i + 1);
                if (i === f.length - 1 || 0 === n) {
                    var m = a(l),
                        g = u(l);
                    if (i == f.length - 1 && m) {
                        var v = m.textContent || "";
                        for (t = 0; t < v.length && !o(v[t]) && !r(v[t]);) 
                            p += v[t++]
                    } else if (0 === n && g) {
                        var y = g.textContent || "";
                        for (t = y.length - 1; t >= 0 && !o(y[t]) && !r(y[t]);) 
                            p = y[t--] + p
                    }
                }
                return p
            }
        }, {}
    ],
    2: [
        function (e, t, n) {
            "use strict";
            function o(e, t) {
                if (!(e instanceof t)) 
                    throw new TypeError("Cannot call a class as a function")
            }
            var r = function () {
                function e(e, t) {
                    for (var n = 0; n < t.length; n++) {
                        var o = t[n];
                        o.enumerable = o.enumerable || !1,
                        o.configurable = !0,
                        "value" in o && (o.writable = !0),
                        Object.defineProperty(e, o.key, o)
                    }
                }
                return function (t, n, o) {
                    return n && e(t.prototype, n),
                    o && e(t, o),
                    t
                }
            }();
            Object.defineProperty(n, "__esModule", {
                value: !0
            });
            var i,
                a = e("./detect"),
                u = e("./optionStorage"),
                c = e("./utils");
            !function (e) {
                function t(e) {
                    var t = document.getElementById(l);
                    return !!t && String(t.dataset.word).trim() === String(e).trim()
                }
                function n() {
                    var e = document.getElementById(l);
                    e && e.remove()
                }
                function i(e, t, n) {
                    f && s(f),
                    f = setTimeout(function () {
                        f = void 0,
                        new d(t, n)
                    }, e)
                }
                function s(e) {
                    e && clearTimeout(e)
                }
                var l = "tooltip",
                    d = function () {
                        function e(t, n) {
                            var r = this;
                            o(this, e),
                            this.id = l,
                            this.word = t,
                            this.event = n,
                            Promise
                                .all([this.translate(), u.getOptions()])
                                .then(function (e) {
                                    r.renderTooltip(e[0], e[1])
                                })
                                .catch(function (e) {})
                            }
                        return r(e, [
                            {
                                key: "getPageCoordinateOfMouseEvent",
                                value: function (e) {
                                    return e || (e = window.event),
                                    e.pageX && e.pageY
                                        ? {
                                            x: e.pageX,
                                            y: e.pageY
                                        }
                                        : e.clientX && e.clientY
                                            ? {
                                                x: e.clientX + (
                                                    document.documentElement.scrollLeft
                                                        ? document.documentElement.scrollLeft
                                                        : document.body.scrollLeft
                                                ),
                                                y: e.clientY + (
                                                    document.documentElement.scrollTop
                                                        ? document.documentElement.scrollTop
                                                        : document.body.scrollTop
                                                )
                                            }
                                            : {
                                                x: 0,
                                                y: 0
                                            }
                                }
                            }, {
                                key: "correctCoordinateOfTooltip",
                                value: function (e, t, n) {
                                    var o = window.pageXOffset,
                                        r = window.pageYOffset,
                                        i = document.documentElement.clientWidth,
                                        a = document.documentElement.clientHeight,
                                        u = e.offsetWidth,
                                        c = e.offsetHeight,
                                        s = t.x,
                                        l = "down" == n.tooltipYPosition
                                            ? t.y + n.tooltipYOffset
                                            : t.y - n.tooltipYOffset - c,
                                        d = r + a;
                                    l + c > d && (l = d - c - 5),
                                    l < r && (l = r);
                                    var f = o + i;
                                    return s + u > f && (s = f - u - 5),
                                    s < o && (s = o), {
                                        x: s,
                                        y: l
                                    }
                                }
                            }, {
                                key: "renderTooltip",
                                value: function (e, t) {
                                    if (!e) 
                                        return null;
                                    document.getElementById(this.id) && n();
                                    var o = document.createElement("div");
                                    o.id = this.id;
                                    var r = "-webkit-gradient(linear, left top, left bottom, from(" + t.backgroundGradColorTop +
                                            "), to(" + t.backgroundGradColorBottom + "))";
                                    o
                                        .style
                                        .setProperty("background", r),
                                    o
                                        .style
                                        .setProperty("display", "block"),
                                    o
                                        .style
                                        .setProperty("padding", "2px 4px"),
                                    o
                                        .style
                                        .setProperty("position", "absolute"),
                                    o
                                        .style
                                        .setProperty("z-index", "2147483647", "important"),
                                    o
                                        .style
                                        .setProperty("font-size", String(t.fontSize) + "pt"),
                                    o
                                        .style
                                        .setProperty("font-weight", t.fontWeight),
                                    o
                                        .style
                                        .setProperty("color", t.textColor),
                                    o
                                        .style
                                        .setProperty("-webkit-border-radius", ".2em"),
                                    o
                                        .style
                                        .setProperty("-webkit-box-shadow", "2px 2px 5px rgba(0,0,0,.4)"),
                                    o.dataset.word = String(e.word),
                                    o.textContent = String(e.word + ": " + e.mean.join(", ")),
                                    document
                                        .getElementsByTagName("body")[0]
                                        .appendChild(o);
                                    var i = this.correctCoordinateOfTooltip(
                                        o,
                                        this.getPageCoordinateOfMouseEvent(this.event),
                                        t
                                    );
                                    o
                                        .style
                                        .setProperty("left", String(i.x) + "px", "important"),
                                    o
                                        .style
                                        .setProperty("top", String(i.y) + "px", "important")
                                }
                            }, {
                                key: "translate",
                                value: function () {
                                    var e = {
                                        query: this.word
                                    };
                                    return new Promise(function (t, n) {
                                        chrome
                                            .runtime
                                            .sendMessage(e, function (e) {
                                                t(e)
                                            })
                                    })
                                }
                            }
                        ]),
                        e
                    }(),
                    f = void 0;
                c
                    .domReady()
                    .then(function () {
                        document.onmousemove = function (e) {
                            u
                                .getOptions(["active", "delayTime"])
                                .then(function (o) {
                                    if (o.active) {
                                        var r = a.default({x: e.clientX, y: e.clientY});
                                        "" != r
                                            ? t(r) || i(o.delayTime, r, e)
                                            : (s(f), n())
                                    }
                                })
                        }
                    })
            }(i || (i = {}))
        }, {
            "./detect": 1,
            "./optionStorage": 3,
            "./utils": 4
        }
    ],
    3: [
        function (e, t, n) {
            "use strict";
            Object.defineProperty(n, "__esModule", {
                value: !0
            }),
            n.defaultOptions = {
                active: !0,
                tooltipYOffset: 30,
                tooltipYPosition: "down",
                fontSize: 9,
                fontWeight: "normal",
                textColor: "rgb(241, 241, 241)",
                backgroundGradColorTop: "rgb(105, 105, 105)",
                backgroundGradColorBottom: "rgb(84, 84, 84)",
                borderColor: "#707070",
                delayTime: 200
            },
            n.setOptions = function (e) {
                return new Promise(function (t, n) {
                    chrome
                        .storage
                        .sync
                        .set(e, t)
                })
            },
            n.getOptions = function (e) {
                return new Promise(function (t, n) {
                    chrome
                        .storage
                        .sync
                        .get(e, t)
                })
            }
        }, {}
    ],
    4: [
        function (e, t, n) {
            "use strict";
            Object.defineProperty(n, "__esModule", {
                value: !0
            }),
            n.domReady = function () {
                return new Promise(function (e, t) {
                    "interactive" === document.readyState || "complete" === document.readyState
                        ? e()
                        : document.addEventListener("DOMContentLoaded", e)
                })
            };
            var o = {
                    16: "images/nonactive16.png",
                    32: "images/nonactive32.png",
                    48: "images/nonactive48.png",
                    64: "images/nonactive64.png",
                    96: "images/nonactive96.png",
                    128: "images/nonactive128.png"
                },
                r = {
                    16: "images/active16.png",
                    32: "images/active32.png",
                    48: "images/active48.png",
                    64: "images/active64.png",
                    96: "images/active96.png",
                    128: "images/active128.png"
                };
            n.changeIcon = function (e) {
                var t = e
                    ? r
                    : o;
                chrome
                    .browserAction
                    .setIcon({path: t})
            }
        }, {}
    ]
}, {}, [2]);