import { genCustomConsole, addStyle, genStyleString } from "mazey";

const listCon = genCustomConsole("[List]");
const currentYear = new Date().getFullYear();
const footerStyle = genStyleString(
  ".footer>.hope-stack>a:first-child" +
  ",div.hope-flex>a[href^='https://doc.oplist.org/faq/howto#']" +
  ",.m-hide",
  [ "display: none" ]
);
const footerDivContent = genStyleString(
  ".footer>.hope-stack:before",
  [
    `content: 'Copyright © ${currentYear} List'`,
    "color: inherit",
    "padding-inline-start: var(--hope-space-1_5)",
    "padding-inline-end: var(--hope-space-1_5)",
    "padding-top: var(--hope-space-1)",
    "padding-bottom: var(--hope-space-1)",
  ]
);

addStyle(footerStyle, { id: "polestar-list-footer" });
addStyle(footerDivContent, { id: "polestar-list-footer-div-content" });

let hideGuestBtnIndex = 0;
const hideGuestBtn = () => {
  listCon.log(`run hideGuestBtn() with the index: ${hideGuestBtnIndex}`);
  const browseGuestBtn = document.evaluate(
    "//button[normalize-space(text())='Browse as a guest' or normalize-space(text())='以游客身份浏览']",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  if (browseGuestBtn && browseGuestBtn.style) {
    browseGuestBtn.style.display = 'none';
    if (hideGuestBtnIndex) clearInterval(hideGuestBtnIndex);
  }
}

window.addEventListener("load", () => {
  if (location.href.includes("@login")) {
    hideGuestBtnIndex = setInterval(hideGuestBtn, 200);
    setTimeout(() => {
      if (hideGuestBtnIndex) clearInterval(hideGuestBtnIndex);
    }, 5000);
  } else {
    listCon.log("the current page is not login page");
  }
});
