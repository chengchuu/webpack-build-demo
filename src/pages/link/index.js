import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { CopyToClipboard } from "react-copy-to-clipboard";
import QRCodeStyling from "qr-code-styling";
import {
  addStyle, genCustomConsole, getQueryParam, loadScript,
  mTrim, updateQueryParam, genHashCode, isValidHttpUrl,
  genStyleString, getBrowserInfo,
} from "mazey";
import {
  getQueryParamUltimate, isHtmlTag, isValidAnyUrl, isValidENCode,
  getStringLength,
} from "./utils";
import { linkBaseUrl, useGenerateShortLinkMutation } from "./linkApi";
import createLinkStore from "./store";
import { linkActions, selectLinkState } from "./linkSlice";

const isDebug = getQueryParam("debug") === "on";
const TinyCon = genCustomConsole("[Link]", { showDate: true, enabled: isDebug });
const foreignBaseUrl = window.TINY_FOREIGN_BASE_URL;
const libBaseUrl = "//i.mazey.net/lib";
const QRCodeFav = "https://i.mazey.net/icon/fav/logo-dark-circle-32x32.png";
const defaultTinyTitle = "备用链接";
const Tiny = () => {
  const dispatch = useDispatch();
  const [ generateShortLink ] = useGenerateShortLinkMutation();
  const {
    oriLink: stateOriLink,
    tinyLink: stateTinyLink,
    queryMsg, copied, showQRCode, loadedLayer,
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
    const oneTime = getQueryParam("onetime") || getQueryParamUltimate("oneTime");
    return generateShortLink({
      oriLink,
      baseUrl,
      oneTime: oneTime === "on" || oneTime === "1",
    }).unwrap().then(link => {
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
      loadedLayer && window.layer.confirm(`检测到输入短字符，将跳转至：<br />${link}`, {
        title: "提示",
        btn: [ "确认", "取消" ],
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
    let ok, retLink;
    const status = new Promise(resolve => {
      ok = resolve;
    });
    if (!isValidAnyUrl(link)) {
      TinyCon.log("convertToMsg Link", link);
      let linkForMsg = link;
      let isTag = false;
      if (isHtmlTag(linkForMsg)) {
        linkForMsg = linkForMsg.replace(/<[^>]+>/g, "");
        isTag = true;
      }
      loadedLayer && window.layer.confirm(`检测到输入${isTag ? "标签" : "文字"}，将通过短链传递：<br />${linkForMsg}`, {
        title: "提示",
        btn: [ "确认", "取消" ],
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
    TinyCon.log(`Ori Link ${stateOriLink}`);
    let realOriLink = "";
    let tinyLink;
    const trimOriLink = mTrim(stateOriLink);
    const suppleHttp = `http://${trimOriLink}`;
    if (trimOriLink === "") {
      msg("不能为空");
      return;
    } else if (isValidAnyUrl(trimOriLink)) {
      realOriLink = trimOriLink;
    } else if (hashCodeToLink(trimOriLink)) {
      return;
    } else if (isValidHttpUrl(suppleHttp)) {
      realOriLink = suppleHttp;
    } else if (await checkMsg(trimOriLink)) {
      realOriLink = msgLink;
    } else {
      msg("请输入正确的链接");
      return;
    }
    if (typeof realOriLink === "string" && realOriLink.includes(" ")) {
      TinyCon.log("Link Before Trim", realOriLink);
      realOriLink = mTrim(realOriLink);
    }
    if (getStringLength(realOriLink) > 500) {
      msg("链接过长，请输入小于 500 字符的链接");
      return;
    }
    TinyCon.log("Ultimate", realOriLink);
    dispatch(linkActions.setOriLink(realOriLink));
    dispatch(linkActions.setBackupTinyLinks([]));
    dispatch(linkActions.setShowQRCode(false));
    loadedLayer && window.layer.load(1);
    try {
      tinyLink = await getTinyLink(realOriLink);
      dispatch(linkActions.setTinyLink(tinyLink));
      dispatch(linkActions.setCopied(false));
      loadedLayer && window.layer.closeAll("loading");
      msg("成功");
    } catch (err) {
      loadedLayer && window.layer.closeAll("loading");
      msg("网络错误");
      TinyCon.error(err);
      return;
    }
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
      getTinyLink(realOriLink, foreignBaseUrl).then(link => {
        if (isValidHttpUrl(link)) {
          bakLinks.push({
            title: defaultTinyTitle,
            link,
            area: "全球",
            copied: false,
          });
          dispatch(linkActions.setBackupTinyLinks([ ...bakLinks ]));
          TinyCon.log("backupTinyLinks (next)", bakLinks);
        }
      }).catch(err => {
        TinyCon.error(err);
      });
    }
  };

  const inputChange = ({ target: { value: inputOriLink } }) => {
    dispatch(linkActions.setOriLink(inputOriLink));
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
    if (!ref.current) {
      return;
    }
    ref.current.replaceChildren();
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
        <input value={stateOriLink}
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
          stateTinyLink && <input value={stateTinyLink} placeholder='请复制短链接' onChange={() => {}} autoFocus={!!queryMsg} />
        }
        {/* Copy Button */}
        {
          stateTinyLink
            ? <CopyToClipboard onCopy={() => dispatch(linkActions.setCopied(true))} text={stateTinyLink}>
              <button>复制</button>
            </CopyToClipboard>
            : ""
        }
        {/* Hint */}
        {
          copied ? <span className='copied'>已复制</span> : ""
        }
        {
          !stateTinyLink ? <span className='placeholder'>生成的短链接~</span> : ""
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
