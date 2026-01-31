/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { Component, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QRCodeStyling from 'qr-code-styling';
import './normalize.scss';
import './tiny.scss';
import {
  addStyle,
  genCustomConsole,
  getQueryParam,
  loadScript,
  mTrim,
  updateQueryParam,
  genHashCode,
  isValidUrl,
  isValidHttpUrl,
  genStyleString,
  deepCopy,
  getBrowserInfo,
  convertCamelToUnder,
} from 'mazey';

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
const TinyCon = genCustomConsole('TinyCon:', { showDate: true });
const linkBaseUrl = '//i.mazey.net';
const foreignBaseUrl = window.TINY_FOREIGN_BASE_URL;
const libBaseUrl = '//i.mazey.net/lib';
const QRCodeFav = 'https://i.mazey.net/icon/fav/logo-dark-circle-32x32.png';
const defaultTinyTitle = '备用链接';
const Tiny = () => {
  const [ori_link, setOriLink] = useState('');
  const [tiny_link, setTinyLink] = useState('');
  const [queryMsg, setQueryMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [loadedLayer, setLoadedLayer] = useState(false);
  const [backupTinyLinks, setBackupTinyLinks] = useState([]);
  const ref = useRef(null);
  // Variates
  let msgLink = '';

  useEffect(() => {
    TinyCon.log('Start');
    localStorage.setItem('mazey_loaded_tiny', '1');
    // Load
    (async () => {
      if (!(window.$ || window.jQuery)) {
        await loadScript(`${libBaseUrl}/jquery/2.1.1/jquery.min.js`);
      }
      await loadScript(`${libBaseUrl}/layer/layer.js`)
        .then(() => {
          setLoadedLayer(true);
        });
      const tempQueryMsg = getQueryParam('msg');
      if (tempQueryMsg) {
        setTinyLink(tempQueryMsg);
        setQueryMsg(tempQueryMsg);
        msg('消息接收成功');
      }
    })();
  }, []);

  const msg = (content, tryAgain = true) => {
    if (loadedLayer) {
      window.layer.msg(content, { time: 2 * 1000 });
    } else if (window.layer && typeof window.layer === 'object') {
      window.layer.msg(content, { time: 2 * 1000 });
    } else if (tryAgain === true) {
      TinyCon.log('Try Again', tryAgain);
      setTimeout(() => {
        msg(content, false);
      }, 1000);
    }
  };

  const getQueryParamUltimate = param => {
    const underParam = convertCamelToUnder(param);
    return getQueryParam(param) || getQueryParam(underParam);
  };

  const getTinyLink = (oriLink, baseUrl) => {
    const params = {
      ori_link: oriLink,
    };
    const oneTime = getQueryParamUltimate('oneTime');
    if (oneTime === '1') {
      Object.assign(params, { one_time: true });
    }
    if (baseUrl) {
      Object.assign(params, { base_url: baseUrl });
    }
    return axios.post(`${linkBaseUrl}/api/gee/generate-short-link`, params)
      .then(res => {
        const link = res.data.tiny_link;
        TinyCon.log('Link', link);
        return link;
      });
  };

  const hashCodeToLink = hashCode => {
    if (typeof hashCode === 'string' && hashCode.length <= 4 && isValidENCode(hashCode)) {
      let link = `${linkBaseUrl}/t/${hashCode.toLowerCase()}`;
      if (!link.includes('http') && !link.includes('https')) {
        link = `https:${link}`;
      }
      TinyCon.log('Link', link);
      loadedLayer && window.layer.confirm(`检测到输入短字符，将跳转至：${link}`, {
        title: '提示',
        btn: ['确认', '取消'],
      }, function () {
        window.open(link);
      }, function () {
        msg('已取消');
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
      TinyCon.log('convertToMsg Link', link);
      let linkForMsg = link;
      let isTag = false;
      if (isHtmlTag(linkForMsg)) {
        linkForMsg = linkForMsg.replace(/<[^>]+>/g, '');
        isTag = true;
      }
      loadedLayer && window.layer.confirm(`检测到输入${isTag ? '标签' : '文字'}，将通过短链传递：${linkForMsg}`, {
        title: '提示',
        btn: ['确认', '取消'],
      }, function () {
        TinyCon.log('linkForMsg', linkForMsg);
        const enMsg = encodeURIComponent(linkForMsg);
        retLink = updateQueryParam(location.href, 'msg', enMsg);
        TinyCon.log('retLink', retLink);
        ok(retLink);
      }, function () {
        msg('已取消');
        ok('cancel');
      });
    } else {
      ok('valid');
    }
    return status;
  };

  const checkMsg = async (link) => {
    let ret = false;
    const tempMsgLinkRet = await convertToMsg(link);
    TinyCon.log('tempMsgLinkRet', tempMsgLinkRet);
    if (tempMsgLinkRet === 'cancel') {
      ret = false;
    } else if (typeof tempMsgLinkRet === 'string' && isValidAnyUrl(tempMsgLinkRet)) {
      msgLink = tempMsgLinkRet;
      ret = true;
    } else if (typeof tempMsgLinkRet === 'string' && tempMsgLinkRet.includes('localhost:9202')) {
      // Debug
      msgLink = tempMsgLinkRet;
      ret = true;
    }
    return ret;
  };

  const fetchShortLink = async () => {
    let real_ori_link = '';
    TinyCon.log(`Ori Link ${ori_link}`);
    const trimOriLink = mTrim(ori_link);
    const suppleHttp = `http://${trimOriLink}`;
    if (trimOriLink === '') {
      msg('不能为空');
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
      // Quickly Visit
      msg('请输入正确的链接');
      return;
    }
    setOriLink(real_ori_link);
    setBackupTinyLinks([]);
    setShowQRCode(false);
    if (typeof real_ori_link === 'string' && real_ori_link.includes(' ')) {
      TinyCon.log('ori_link Before Trim', real_ori_link);
      real_ori_link = mTrim(real_ori_link);
    }
    loadedLayer && window.layer.load(1);
    TinyCon.log('Ultimate', real_ori_link);
    const tinyLink = await getTinyLink(real_ori_link).then(link => {
      loadedLayer && window.layer.closeAll('loading');
      const tiny_link = link;
      setTinyLink(tiny_link);
      setCopied(false);
      msg('成功');
      return tiny_link;
    }).catch(err => {
      loadedLayer && window.layer.closeAll('loading');
      msg('网络错误');
      TinyCon.error(err.message);
    });
    // QRCode
    if (typeof tinyLink === 'string' && tinyLink.includes('http')) {
      setShowQRCode(true);
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
            area: '全球',
            copied: false,
          });
          // setBackupTinyLinks([...bakLinks]);
          setBackupTinyLinks(deepCopy(bakLinks));
          TinyCon.log('backupTinyLinks', backupTinyLinks);
        }
      });
    }
  };

  const inputChange = ({ target: { value: ori_link } }) => {
    setOriLink(ori_link);
  };

  const handleKeyDown = ({ key }) => {
    // https://www.w3.org/TR/uievents-key/#keys-whitespace
    if (key === 'Enter') {
      fetchShortLink();
    }
  };

  const isHtmlTag = str => {
    return /<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/g.test(str);
  };

  const isValidAnyUrl = url => {
    return isValidUrl(url);
  };

  const isValidENCode = str => {
    return /^[a-zA-Z]+$/g.test(str);
  };

  const copyOneOfBackupTinys = (index) => {
    let backupTinyLink = backupTinyLinks[index];
    if (backupTinyLink) {
      backupTinyLink = Object.assign(backupTinyLink, { copied: true });
      setBackupTinyLinks(prevBackupTinyLinks => {
        const newBackupTinyLinks = [...prevBackupTinyLinks];
        newBackupTinyLinks[index] = backupTinyLink;
        return newBackupTinyLinks;
      });
    }
  };

  const convertUrlStringToQRCode = url => {
    TinyCon.log('convertUrlStringToQRCode', url);
    const qrCodeParams = {
      width: 200,
      height: 200,
      data: url,
      dotsOptions: {
        color: '#111111',
        type: 'square',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
    };
    const { system } = getBrowserInfo();
    if (system !== 'ios') {
      Object.assign(qrCodeParams, {
        image: QRCodeFav,
        imageOptions: {
          crossOrigin: 'anonymous',
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
          placeholder={queryMsg ? '消息接收成功，复制下面的文字，或者在此输入长链接或短文字' : '请输入长链接'}
          autoFocus={!queryMsg}
        />
        <button type='button' onClick={fetchShortLink}>生成</button>
      </div>
      <div className='result-show'>
        {/* 短链接 */}
        {
          tiny_link && <input value={tiny_link} placeholder='请复制短链接' onChange={() => {}} autoFocus={!!queryMsg} />
        }
        {/* 复制按钮 */}
        {
          tiny_link
            ? <CopyToClipboard onCopy={() => setCopied(true)} text={tiny_link}>
              <button>复制</button>
            </CopyToClipboard>
            : ''
        }
        {/* 提示 */}
        {
          copied ? <span className='copied'>已复制</span> : ''
        }
        {
          !tiny_link ? <span className='placeholder'>生成的短链接~</span> : ''
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
              tiny.copied ? <span className='copied'>已复制</span> : ''
            }
          </div>
        ))
      }
      {
        showQRCode
          ? <div className='generated-result is-qr'>
            <div className='qr-code' id='qr-code' ref={ref}></div>
          </div>
          : ''
      }
    </div>
  );
};

// Example: TinyInit('#tiny-box', { isGrayBackground: true });
const TinyInit = (selector = '', options = {
  isGrayBackground: false,
}) => {
  if (!selector) {
    return;
  }
  const { isGrayBackground } = options;
  const container = document.querySelector(selector);
  if (container) {
    const root = createRoot(container);
    root.render(<Tiny />);
    if (isGrayBackground) {
      const styleStr = genStyleString('#tiny-box', [
        'background-color: #eee',
        'border-radius: 4px',
      ]);
      addStyle(styleStr);
    }
  }
};

TinyInit('#tiny-box', { isGrayBackground: true });

window.TINY_INIT = TinyInit;
