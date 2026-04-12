import { addStyle, genStyleString } from "mazey";

const footerStyle = genStyleString(
  ".footer>.hope-stack>a:first-child",
  [ "display: none" ]
)
addStyle(footerStyle, { id: "polestar-list-footer" })

const currentYear = new Date().getFullYear();
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
)
addStyle(footerDivContent, { id: "polestar-list-div-content" })

console.log("footerStyle", footerStyle);
console.log("footerDivContent", footerDivContent);
