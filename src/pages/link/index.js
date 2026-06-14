/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { CopyToClipboard } from "react-copy-to-clipboard";
import QRCodeStyling from "qr-code-styling";
import {
  addStyle, genCustomConsole, getQueryParam, loadScript,
  mTrim, updateQueryParam, genHashCode,
  isValidHttpUrl, genStyleString, getBrowserInfo,
} from "mazey";
import {
  getQueryParamUltimate, isHtmlTag, isValidAnyUrl, isValidENCode,
} from "./utils";
import createLinkStore from "./store";
import { linkActions, selectLinkState } from "./linkSlice";

// Test Examples:
// http://localhost:9202/tiny.html
// https://www.example.com/tiny
//  https://www.example.com/tiny
// www.example.com/tiny
// ftp://main/sub?id=2333
// sheeee://hahah/sub?id=num
// 短消息
// AAa
// b
// <a href="https://www.example.com/tiny" target="_blank">xxx</a><br/>
// http://www.example.com/tiny/index.html?msg=<a href="https://www.example.com/tiny" target="_blank">xxx</a><br/>
const isDebug = getQueryParam("debug") === "1";
const TinyCon = genCustomConsole("[Link]", { showDate: true, enabled: isDebug });
const linkBaseUrl = "//i.mazey.net";
const foreignBaseUrl = window.TINY_FOREIGN_BASE_URL;
const libBaseUrl = "//i.mazey.net/lib";
const QRCodeFav = "https://i.mazey.net/icon/fav/logo-dark-circle-32x32.png";
const defaultTinyTitle = "备用链接";
const Tiny = () => {
  const dispatch = useDispatch();
  const {
    oriLink: ori_link,
    tinyLink: tiny_link,
    queryMsg,
    copied,
    showQRCode,
    loadedLayer,
    backupTinyLinks,
  } = useSelector(selectLinkState);
  const ref = useRef(null);
  let msgLink = "";

  useEffect(() => {
    TinyCon.log("Start");
    localStorage.setItem("mazey_loaded_tiny", "1");
    // Load
    (async () => {
      if (!(window.$ || window.jQuery)) {
        await loadScript(`${libBaseUrl}/jquery/2.1.1/jquery.min.js`);
      }
      await loadScript(`${libBaseUrl}/layer/layer.js`)
        .then(() => {
          dispatch(linkActions.setLoadedLayer(true));
        });
      const tempQueryMsg = getQueryParam("msg");
      if (tempQueryMsg) {
        dispatch(linkActions.setTinyLink(tempQueryMsg));
        dispatch(linkActions.setQueryMsg(tempQueryMsg));
        msg("消息接收成功");
      }
    })();
  }, []);

  const msg = (content, tryAgain = true) => {
    if (loadedLayer) {
      window.layer.msg(content, { time: 2 * 1000 });
    } else if (window.layer && typeof window.layer === "object") {
      window.layer.msg(content, { time: 2 * 1000 });
    } else if (tryAgain === true) {
      TinyCon.log("Try Again", tryAgain);
      setTimeout(() => {
        msg(content, false);
      }, 1000);
    }
  };

  const getTinyLink = (oriLink, baseUrl) => {
    const params = {
      ori_link: oriLink,
    };
    const oneTime = getQueryParamUltimate("oneTime");
    if (oneTime === "1") {
      Object.assign(params, { one_time: true });
    }
    if (baseUrl) {
      Object.assign(params, { base_url: baseUrl });
    }
    return axios.post(`${linkBaseUrl}/api/gee/generate-short-link`, params)
      .then(res => {
        const link = res.data.tiny_link;
        TinyCon.log("Link", link);
        return link;
      });
  };

  const hashCodeToLink = hashCode => {
    if (typeof hashCode === "string" && hashCode.length <= 4 && isValidENCode(hashCode)) {
      let link = `${linkBaseUrl}/t/${hashCode.toLowerCase()}`;
      if (!link.includes("http") && !link.includes("https")) {
        link = `https:${link}`;
      }
      TinyCon.log("Link", link);
      loadedLayer && window.layer.confirm(`检测到输入短字符，将跳转至：${link}`, {
        title: "提示",
        btn: ["确认", "取消"],
      }, function () {
        window.open(link);
      }, function () {
        msg("已取消");
      });
      return true;
    }
    return false;
  };

  const convertToMsg = link => {
    let ok, fail, retLink;
    const status = new Promise((resolve, reject) => {
      ok = resolve;
      fail = reject;
    });
    if (!isValidAnyUrl(link)) {
      TinyCon.log("convertToMsg Link", link);
      let linkForMsg = link;
      let isTag = false;
      if (isHtmlTag(linkForMsg)) {
        linkForMsg = linkForMsg.replace(/<[^>]+>/g, "");
        isTag = true;
      }
      loadedLayer && window.layer.confirm(`检测到输入${isTag ? "标签" : "文字"}，将通过短链传递：${linkForMsg}`, {
        title: "提示",
        btn: ["确认", "取消"],
      }, function () {
        TinyCon.log("linkForMsg", linkForMsg);
        const enMsg = encodeURIComponent(linkForMsg);
        retLink = updateQueryParam(location.href, "msg", enMsg);
        TinyCon.log("retLink", retLink);
        ok(retLink);
      }, function () {
        msg("已取消");
        ok("cancel");
      });
    } else {
      ok("valid");
    }
    return status;
  };

  const checkMsg = async (link) => {
    let ret = false;
    const tempMsgLinkRet = await convertToMsg(link);
    TinyCon.log("tempMsgLinkRet", tempMsgLinkRet);
    if (tempMsgLinkRet === "cancel") {
      ret = false;
    } else if (typeof tempMsgLinkRet === "string" && isValidAnyUrl(tempMsgLinkRet)) {
      msgLink = tempMsgLinkRet;
      ret = true;
    } else if (typeof tempMsgLinkRet === "string" && tempMsgLinkRet.includes("localhost:9202")) {
      // Debug
      msgLink = tempMsgLinkRet;
      ret = true;
    }
    return ret;
  };

  const fetchShortLink = async () => {
    let real_ori_link = "";
    TinyCon.log(`Ori Link ${ori_link}`);
    const trimOriLink = mTrim(ori_link);
    const suppleHttp = `http://${trimOriLink}`;
    if (trimOriLink === "") {
      msg("不能为空");
      return;
    } else if (isValidAnyUrl(trimOriLink)) {
      real_ori_link = trimOriLink;
    } else if (hashCodeToLink(trimOriLink)) {
      return;
    } else if (isValidHttpUrl(suppleHttp)) {
      real_ori_link = suppleHttp;
    } else if (await checkMsg(trimOriLink)) {
      real_ori_link = msgLink;
    } else {
      msg("请输入正确的链接");
      return;
    }
    dispatch(linkActions.setOriLink(real_ori_link));
    dispatch(linkActions.setBackupTinyLinks([]));
    dispatch(linkActions.setShowQRCode(false));
    if (typeof real_ori_link === "string" && real_ori_link.includes(" ")) {
      TinyCon.log("ori_link Before Trim", real_ori_link);
      real_ori_link = mTrim(real_ori_link);
    }
    loadedLayer && window.layer.load(1);
    TinyCon.log("Ultimate", real_ori_link);
    const tinyLink = await getTinyLink(real_ori_link).then(link => {
      loadedLayer && window.layer.closeAll("loading");
      const tiny_link = link;
      dispatch(linkActions.setTinyLink(tiny_link));
      dispatch(linkActions.setCopied(false));
      msg("成功");
      return tiny_link;
    }).catch(err => {
      loadedLayer && window.layer.closeAll("loading");
      msg("网络错误");
      TinyCon.error(err.message);
    });
    // QRCode
    if (typeof tinyLink === "string" && tinyLink.includes("http")) {
      dispatch(linkActions.setShowQRCode(true));
      setTimeout(() => {
        convertUrlStringToQRCode(tinyLink);
      }, 500);
    }
    // Backup
    const bakLinks = [];
    if (foreignBaseUrl) {
      getTinyLink(real_ori_link, foreignBaseUrl).then(link => {
        if (isValidHttpUrl(link)) {
          bakLinks.push({
            title: defaultTinyTitle,
            link,
            area: "全球",
            copied: false,
          });
          dispatch(linkActions.setBackupTinyLinks([...bakLinks]));
          TinyCon.log("backupTinyLinks", backupTinyLinks);
        }
      });
    }
  };

  const inputChange = ({ target: { value: ori_link } }) => {
    dispatch(linkActions.setOriLink(ori_link));
  };

  const handleKeyDown = ({ key }) => {
    if (key === "Enter") {
      fetchShortLink();
    }
  };

  const copyOneOfBackupTinys = (index) => {
    if (backupTinyLinks[index]) {
      dispatch(linkActions.markBackupTinyCopied(index));
    }
  };

  const convertUrlStringToQRCode = url => {
    TinyCon.log("convertUrlStringToQRCode", url);
    const qrCodeParams = {
      width: 200,
      height: 200,
      data: url,
      dotsOptions: {
        color: "#111111",
        type: "square",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
    };
    const { system } = getBrowserInfo();
    if (system !== "ios") {
      Object.assign(qrCodeParams, {
        image: QRCodeFav,
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 0,
        },
      });
    }
    const qrCode = new QRCodeStyling(qrCodeParams);
    qrCode.append(ref.current);
  };

  return (
    <div className='tiny-box'>
      <div className='generate'>
        <input value={ori_link}
          onChange={inputChange}
          onKeyDown={handleKeyDown}
          placeholder={queryMsg ? "消息接收成功，复制下面的文字，或者在此输入长链接或短文字" : "请输入长链接"}
          autoFocus={!queryMsg}
        />
        <button type='button' onClick={fetchShortLink}>生成</button>
      </div>
      <div className='result-show'>
        {/* Short Link */}
        {
          tiny_link && <input value={tiny_link} placeholder='请复制短链接' onChange={() => {}} autoFocus={!!queryMsg} />
        }
        {/* Copy Button */}
        {
          tiny_link
            ? <CopyToClipboard onCopy={() => dispatch(linkActions.setCopied(true))} text={tiny_link}>
              <button>复制</button>
            </CopyToClipboard>
            : ""
        }
        {/* Hint */}
        {
          copied ? <span className='copied'>已复制</span> : ""
        }
        {
          !tiny_link ? <span className='placeholder'>生成的短链接~</span> : ""
        }
      </div>
      {
        backupTinyLinks.map((tiny, index) => (
          <div className='generated-result is-backup' key={`${index}-${genHashCode(tiny.link)}`}>
            <span>{tiny.title} {index + 1}「{tiny.area}」：</span>
            <a href={tiny.link} target='_blank' title='备用链接'>{tiny.link}</a>
            <CopyToClipboard onCopy={() => copyOneOfBackupTinys(index)} text={tiny.link}>
              <button>复制</button>
            </CopyToClipboard>
            {
              tiny.copied ? <span className='copied'>已复制</span> : ""
            }
          </div>
        ))
      }
      {
        showQRCode
          ? <div className='generated-result is-qr'>
            <div className='qr-code' id='qr-code' ref={ref}></div>
          </div>
          : ""
      }
    </div>
  );
};

// Example: TinyInit('#tiny-box', { isGrayBackground: true });
const TinyInit = (selector = "", options = {
  isGrayBackground: false,
}) => {
  if (!selector) {
    return;
  }
  const { isGrayBackground } = options;
  const container = document.querySelector(selector);
  if (container) {
    const root = createRoot(container);
    const store = createLinkStore();
    root.render(
      <Provider store={store}>
        <Tiny />
      </Provider>,
    );
    if (isGrayBackground) {
      const styleStr = genStyleString("#tiny-box", [
        "background-color: #eee",
        "border-radius: 4px",
      ]);
      addStyle(styleStr);
    }
  }
};

TinyInit("#tiny-box", { isGrayBackground: true });

window.TINY_INIT = TinyInit;
