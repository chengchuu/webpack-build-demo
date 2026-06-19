/* eslint-disable max-len */
import { getDomain, getLocalStorage, setLocalStorage } from "mazey";

// Example: https://blog.mazey.net
const prefixBaseUrl = `${location.protocol}//${location.host}`;

if (!document.querySelectorAll) {
  document.querySelectorAll = function (selectors) {
    const style = document.createElement("style"); const elements = []; let element;
    document.documentElement.firstChild.appendChild(style);
    document._qsa = [];
    style.styleSheet.cssText = selectors + "{x-qsa:expression(document._qsa && document._qsa.push(this))}";
    window.scrollBy(0, 0);
    style.parentNode.removeChild(style);
    while (document._qsa.length) {
      element = document._qsa.shift();
      element.style.removeAttribute("x-qsa");
      elements.push(element);
    }
    document._qsa = null;
    return elements;
  };
}

if (!document.querySelector) {
  document.querySelector = function (selectors) {
    const elements = document.querySelectorAll(selectors);
    return (elements.length) ? elements[0] : null;
  };
}

if (!Array.prototype.reduce) {
  Object.defineProperty(Array.prototype, "reduce", {
    value: function (callback /*, initialValue */) {
      if (this === null) {
        throw new TypeError("Array.prototype.reduce " +
          "called on null or undefined");
      }
      if (typeof callback !== "function") {
        throw new TypeError(callback +
          " is not a function");
      }
      const o = Object(this);
      const len = o.length >>> 0;
      let k = 0;
      let value;
      if (arguments.length >= 2) {
        value = arguments[1];
      } else {
        while (k < len && !(k in o)) {
          k++;
        }
        if (k >= len) {
          throw new TypeError("Reduce of empty array " +
            "with no initial value");
        }
        value = o[k++];
      }
      while (k < len) {
        if (k in o) {
          value = callback(value, o[k], k, o);
        }
        k++;
      }
      return value;
    },
  });
}

if (!Date.now) {
  Date.now = function now () {
    return new Date().getTime();
  };
}

export function getFinger () {
  const Fingerprint2 = require("fingerprintjs2");
  return new Promise(resolve => {
    if (window.requestIdleCallback) {
      requestIdleCallback(function () {
        Fingerprint2.getV18(function (result) {
          resolve(result);
        });
      });
    } else {
      setTimeout(function () {
        Fingerprint2.getV18(function (result) {
          resolve(result);
        });
      }, 500);
    }
  });
}

export function getLocal (k) {
  return getLocalStorage(`mazey_${k}`);
}

export function setLocal (k, v) {
  return setLocalStorage(`mazey_${k}`, v);
}

export class Nav {
  static addBlank () {
    const newPageStr = "+";
    if (document.querySelectorAll(".menu-item>a").length) {
      const nodeList = document.querySelectorAll(".menu-item>a");
      let len = nodeList.length;
      while (len--) {
        const text = nodeList[len].innerText;
        if (text.includes(newPageStr)) {
          nodeList[len].setAttribute("target", "_blank");
        }
      }
      const img = new Image();
      const imgSrc = `${prefixBaseUrl}/wp-content/uploads/2023/02/new-page-tiny.png`;
      img.onload = function () {
        let len = nodeList.length;
        while (len--) {
          const text = nodeList[len].innerText;
          if (text.includes(newPageStr)) {
            const newText = text.replace(newPageStr, "");
            const thatNode = nodeList[len];
            thatNode.innerText = newText;
            const svgEl = new Image();
            svgEl.src = imgSrc;
            svgEl.style.width = "1.1em";
            svgEl.style.verticalAlign = "-0.15em";
            thatNode.appendChild(svgEl);
          }
        }
      };
      img.src = imgSrc;
    }
  }
}

export class Style {
  static addBodyBGC () {
    const styleFrag = document.createDocumentFragment();
    const defaultStyle = document.createElement("style");
    defaultStyle.innerHTML = `
      body {
        transition: background-image 1s ease-in;
      }
    `;
    styleFrag.appendChild(defaultStyle);
    const customStyle = document.createElement("style");
    customStyle.setAttribute("id", "m-custom-background-css");
    styleFrag.appendChild(customStyle);
    document.head.appendChild(styleFrag);
    const rightBgcImgs = [
      "/wp-content/uploads/2018/07/69875238_p0_medium.jpg",
      "/wp-content/uploads/2018/07/69874718_p0_medium.jpg",
      "/wp-content/uploads/2018/07/saber5HnFv_medium.jpg",
      "/wp-content/uploads/2018/07/saber8nUHr_medium.jpg",
      "/wp-content/uploads/2018/07/saber11135_medium.jpg",
      "/wp-content/uploads/2018/08/69502454_p0_medium.jpg",
      "/wp-content/uploads/2018/08/69526827_p0_medium.jpg",
    ].map(path => `${prefixBaseUrl}${path}`);
    const leftBgcImgs = [];
    const bgcImgs = [];
    if (Math.ceil(Math.random() * 10) >= Math.ceil(leftBgcImgs.length / rightBgcImgs.length * 10)) {
      for (let i = 0, m = rightBgcImgs.length; i < m; ++i) {
        bgcImgs.push({
          direction: "right",
          imgUrl: rightBgcImgs[i],
        });
      }
    } else {
      for (let i = 0, m = leftBgcImgs.length; i < m; ++i) {
        bgcImgs.push({
          direction: "left",
          imgUrl: leftBgcImgs[i],
        });
      }
    }
    function rollBgcImg () {
      const showIndex = Math.floor(Math.random() * bgcImgs.length);
      const imgSrc = bgcImgs[showIndex].imgUrl;
      const imgInstance = new Image();
      const imgCallback = () => {
        imgInstance.removeEventListener("load", imgCallback);
        document.querySelector("#m-custom-background-css").innerHTML = `
          @media (min-width: 992px) {
            body {
                background-image: url(${imgSrc});
                background-position: ${bgcImgs[showIndex].direction} top;
                background-size: contain;
                background-repeat: no-repeat;
                background-attachment: fixed;
              }
          }
        `;
        setTimeout(() => {
          rollBgcImg();
        }, 60000);
      };
      imgInstance.addEventListener("load", imgCallback);
      imgInstance.src = imgSrc;
    }
    rollBgcImg();
  }

  static alterSearch () {
    if (document.querySelector(".search-icon>svg") && document.querySelector("#close-search>svg")) {
      document.querySelector(".search-icon>svg").addEventListener("click", () => {
        document.querySelector(".site-header").style.background = "#ffffff";
      });
      document.querySelector("#close-search>svg").addEventListener("click", () => {
        document.querySelector(".site-header").style.background = "rgba(255, 255, 255, .7)";
      });
    }
  }
}

export class Container {
  static sortCat () {
    if (document.querySelector(".widget_categories>ul") && document.querySelectorAll(".widget_categories>ul>li").length) {
      const catFrag = document.createDocumentFragment();
      const catDomUl = document.querySelector(".widget_categories>ul");
      const catDomLis = document.querySelectorAll(".widget_categories>ul>li");
      let [catM, catArr] = [new Map(), []];
      for (const li of catDomLis) {
        const liSize = parseInt(li.innerText.match(/\d+/g)[0], 10);
        catM.set(li, liSize);
      }
      catArr = [...catM].sort((a, b) => b[1] - a[1]);
      for (const [li, size] of catArr) {
        catFrag.appendChild(li);
        setLocal("size", size);
      }
      catDomUl.appendChild(catFrag);
    }
  }

  static diaryIcon () {
    const entryTitles = location.href.includes("html")
      ? document.querySelectorAll(".entry-title")
      : document.querySelectorAll(".entry-title>a");
    if (entryTitles.length) {
      entryTitles.forEach(elm => {
        if (elm.innerText.includes("私密：")) {
          elm.innerHTML = elm.innerText
            .replace(
              "私密：",
              `<img
              style="width: 1em; height: 1em; vertical-align: -.11em; margin-right: 0.2em;"
              src="${prefixBaseUrl}/wp-content/uploads/2019/05/mazey-punch-card.png">`,
            );
        }
      });
    }
  }

  static hideAdminHeader () {
    const ii = document.querySelector("#wpadminbar");
    if (ii && document.body.contains(ii) && !location.href.includes("wp-admin")) {
      ii.innerText = "后除提醒您：道路千万条，安全第一条。行车不规范，亲人两行泪。道路千万条，安全第一条。行车不规范，亲人两行泪。";
    }
  }

  static visit (ok) {
    const that = this;
    let firstVisitTimestamp = getLocal("first_visit_timestamp");
    const nowVisitTimestamp = Date.now();
    if (!firstVisitTimestamp) {
      firstVisitTimestamp = Date.now();
      setLocal("first_visit_timestamp", firstVisitTimestamp);
    }
    let visitorBrowse = getLocal("visitor_browse") || [];
    const url = getDomain({
      url: location.href,
      rules: ["origin", "pathname", "search"],
    });
    const homeUrl = getDomain({
      url: location.href,
      rules: ["origin"],
    }) + "/";
    const title = document.title;
    visitorBrowse = new Map(visitorBrowse);
    if (visitorBrowse.has(url)) {
      const browseValue = visitorBrowse.get(url);
      browseValue.timestamps.push(Date.now());
    } else {
      visitorBrowse.set(url, {
        title,
        timestamps: [Date.now()],
      });
    }
    setLocal("visitor_browse", [...visitorBrowse]);
    const [maxUrl, { title: maxTitle, timestamps: maxTimestamps }] = [...visitorBrowse]
      .filter(([url], i, arr) => arr.length > 1 ? url !== homeUrl : true)
      .sort(([, { timestamps: arrA }], [, { timestamps: arrB }]) => arrB.length - arrA.length)[0];
    let visitorFinger = getLocal("visitor_finger");
    if (!visitorFinger) {
      getFinger()
        .then(result => {
          visitorFinger = result;
          setLocal("visitor_finger", visitorFinger);
          that.logVisitorInfo({ visitorFinger, firstVisitTimestamp, nowVisitTimestamp, maxTitle, maxUrl, maxTimestamps, ok });
        });
    } else {
      that.logVisitorInfo({ visitorFinger, firstVisitTimestamp, nowVisitTimestamp, maxTitle, maxUrl, maxTimestamps, ok });
    }
    return "Visited!";
  }

  static recordVisitor (ok) {
    if (window.top !== window.self) {
      window.top.location.href = window.self.location.href + "?act=jump";
    }
    if (new Date() >= new Date("2021-10-31 23:59:59")) {
      const visitorFinger = getLocal("visitor_finger");
      ok && ok({ finger: visitorFinger });
      return null;
    }
    function filterURL (url) {
      const urlLen = url.length;
      let retMz;
      if (urlLen > 50) {
        retMz = url.substr(0, 50);
      } else {
        retMz = url;
      }
      return retMz;
    }
    const visitorFinger = getLocal("visitor_finger");
    window.jsonpCallback = function (result) {
      if (result && result.data && typeof result.data === "object") {
        const data = result.data;
        Object.keys(data).forEach(k => {
          setLocal(k, data[k]);
        });
      }
      ok && ok({ finger: visitorFinger });
    };
    const referrerMz = filterURL(escape(document.referrer));
    const hrefMz = filterURL(escape(window.location.href));
    const titleMz = filterURL(document.title);
    const JSONP = document.createElement("script");
    JSONP.type = "text/javascript";
    let srcUrl = "https://mazey.cn/server/ip?callback=window.jsonpCallback&judgemz=413322&referrermz=" + referrerMz + "&hrefmz=" + hrefMz + "&titlemz=" + titleMz;
    if (visitorFinger) {
      srcUrl += `&visitor_fingerprint=${visitorFinger}`;
    } else {
      console.warn("Robot?");
      srcUrl += "&visitor_fingerprint=unknown";
    }
    JSONP.src = srcUrl;
    document.getElementsByTagName("head")[0].appendChild(JSONP);
  }

  static logVisitorInfo ({ visitorFinger, firstVisitTimestamp, nowVisitTimestamp, maxTitle, maxUrl, maxTimestamps, ok }) {
    this.recordVisitor(ok);
    setLocal("log_visitor_info", { visitorFinger, firstVisitTimestamp, nowVisitTimestamp, maxTitle, maxUrl, maxTimestamps, ok });
  }
}

export class Address {
  // 跳转 SSL
  static http2Https () {
    if (location.hostname === "blog.mazey.net" && location.protocol === "http:") {
      location.protocol = "https:";
    }
  }
}
