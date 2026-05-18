/* eslint-disable no-undef */
import { formatDate, getCookie, isNonEmptyArray, genCustomConsole, setImgWidHeiBySrc } from "mazey";
import { toBase64 } from "./helpers/to-base64";

const realjQuery = window.jQuery || window.$;
const ConCon = genCustomConsole("[Confluence]");

ConCon.log("loaded");
if (realjQuery) {
  const $ = realjQuery;
  $(".wiki-content>p>br").hide();
  $(".wiki-content td.confluenceTd>a").after("<br />");
  $(".entry-content td>a").after("<br />");
  let userName, zhUserName;
  const enUserName = getCookie("username") || "unknown";
  const zhUserNameDom = $("#user-menu-link");
  if (zhUserNameDom.length) {
    zhUserName = zhUserNameDom.attr("title");
  }
  if (zhUserName) {
    userName = `${zhUserName}/${enUserName}`;
  } else {
    userName = enUserName;
  }
  let pageTitle = document.title;
  if (typeof pageTitle === "string" && pageTitle.length) {
    const titleArr = pageTitle.split("-");
    if (isNonEmptyArray(titleArr)) {
      pageTitle = titleArr[0];
    }
  }
  const settings = {
    url: decodeURIComponent("https%3A%2F%2Fi.mazey.net%2Fserver%2Flog%2Fadd"),
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      log_type: "confluence",
      content: `「${userName}」visited「[${pageTitle}](${location.href})」at「${formatDate(new Date(), "yyyy-MM-dd hh:mm:ss")}」`,
    }),
  };
  $.ajax(settings).done(function (response) {
    ConCon.log(response);
  });
  function addIconToA (selector = ".wiki-content") {
    const aDom = $(`${selector} a`);
    if (aDom.length) {
      aDom.each(function () {
        const href = $(this).text();
        if (href.includes("#date-")) {
          const imgSrc = decodeURIComponent("https%3A%2F%2Fi.mazey.net%2Fuploads%2F2023%2F04%2Fdate-blue.png");
          $(this).html($(this).html().replace("#date-", `<img src="${imgSrc}" />`));
          $(this).css({
            alignItems: "center",
            flexWrap: "wrap",
          });
          const len = "0.8em";
          $(this).find("img").css({
            width: len,
            height: len,
            marginLeft: "0.2em",
            marginRight: "0.1em",
          });
        }
      });
    }
  }
  addIconToA();
  addIconToA(".entry-content");
  setImgWidHeiBySrc();
  $(window).on("load", function () {
    try {
      setImgWidHeiBySrc();
    } catch (err) {
      ConCon.log("setImgWidthHeight error", err);
    }
  });
  function replaceBrWithLineBreak (className) {
    if (!$("." + className).length) {
      return;
    }
    $("." + className + " table td:contains('Br')").each(function () {
      if ($(this).text().match(/(Browser|Break|Brave|Break)/)) return;
      const html = $(this).html().replace(/Br/g, "<br style=\"display: inline;\" />");
      $(this).html(html);
    });
    $("." + className + " table td:contains('BRR')").each(function () {
      const html = $(this).html().replace(/BRR/g, "<br style=\"display: inline;\" />");
      $(this).html(html);
    });
  }
  replaceBrWithLineBreak("wiki-content");
  replaceBrWithLineBreak("entry-content");
}
