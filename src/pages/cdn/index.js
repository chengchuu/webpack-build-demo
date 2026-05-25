/**
 * Load resources from a CDN.
 */
import { loadCSS, loadScript } from "mazey";

loadCSS("//i.mazey.net/lib/fontawesome/5.15.4/css/all.css");
loadCSS("//i.mazey.net/lib/bootstrap/3.4.1/css/bootstrap.min.css");
// Require jQuery
loadScript("//i.mazey.net/lib/jquery/2.1.1/jquery.min.js")
  .then(() => {
    loadScript("//i.mazey.net/lib/bootstrap/3.4.1/js/bootstrap.min.js");
    loadScript("//i.mazey.net/lib/layer/layer.js");
  });
loadScript("//i.mazey.net/lib/lodash/4.17.21/lodash.min.js");
loadScript("//i.mazey.net/lib/vue/2.6.12/vue.min.js");
loadScript("//i.mazey.net/lib/html5shiv/3.7.3/html5shiv.min.js");
loadScript("//i.mazey.net/lib/respond/1.4.2/respond.min.js");
loadScript("//i.mazey.net/lib/mazey/3.6.6/mazey.min.js");
