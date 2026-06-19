import { genCustomConsole, addStyle, genStyleString } from "mazey";
import { onUrlChange } from "./helpers/on-url-change";

const listCon = genCustomConsole("[List]");

const currentYear = new Date().getFullYear();
const listHideStyle = genStyleString(
  ".footer>.hope-stack>a:first-child" +
  ",div.hope-flex>a[href^='https://doc.oplist.org/faq/howto#']" +
  ",div.hope-stack>a[href='/@manage/about']" +
  ",div.hope-stack>a[href='https://doc.oplist.org']" +
  ",.m-hide",
  ["display: none"],
);
const footerDivStyle = genStyleString(
  ".footer>.hope-stack:before",
  [
    `content: 'Copyright © ${currentYear} List'`,
    "color: inherit",
    "padding-inline-start: var(--hope-space-1_5)",
    "padding-inline-end: var(--hope-space-1_5)",
    "padding-top: var(--hope-space-1)",
    "padding-bottom: var(--hope-space-1)",
  ],
);
addStyle(listHideStyle + footerDivStyle, { id: "polestar-list" });

let hideGuestBtnIndex = 0;
const hideGuestBtn = () => {
  listCon.log(`run hideGuestBtn() with the index: ${hideGuestBtnIndex}`);
  const browseGuestBtn = document.evaluate(
    "//button[normalize-space(text())='Browse as a guest' or normalize-space(text())='以游客身份浏览']",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  if (browseGuestBtn && browseGuestBtn.style) {
    browseGuestBtn.style.display = "none";
    if (hideGuestBtnIndex) clearInterval(hideGuestBtnIndex);
  }
};
const timeToHideGuestBtn = () => {
  if (location.href.includes("@login")) {
    if (hideGuestBtnIndex) clearInterval(hideGuestBtnIndex);
    hideGuestBtnIndex = setInterval(hideGuestBtn, 200);
    setTimeout(() => {
      if (hideGuestBtnIndex) clearInterval(hideGuestBtnIndex);
    }, 5000);
  } else {
    listCon.log("the current page is not login page:", location.href);
  }
};

window.addEventListener("load", timeToHideGuestBtn);
onUrlChange(({ url }) => {
  listCon.log("URL changed to:", url);
  timeToHideGuestBtn();
});
