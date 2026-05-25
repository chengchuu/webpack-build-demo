import { loadScript, isSafePWAEnv } from "mazey";
import { hideHeaderInTOC, hideSidebar } from "mazey-wordpress-utils";
import { Nav, Style, Container, Address, setLocal } from "./previous";

(function (window) {
  setLocal("polestar_version", "Monday_March_21st_2025");
  window.polestarLoadScript = loadScript;
  window.polestarIsSafePWAEnv = isSafePWAEnv;
  window.hideHeaderInTOC = hideHeaderInTOC;
  window.hideSidebar = hideSidebar;
  Nav.addBlank();
  Style.alterSearch();
  Container.hideAdminHeader();
  Container.sortCat();
  Container.diaryIcon();
  Container.visit();
  // Address.http2Https();
})(window);
