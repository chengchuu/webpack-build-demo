const { merge } = require("webpack-merge");
const baseConf = require("./webpack.config.base");

module.exports = merge(baseConf, { /* Production Configuration */
  mode: "production",
});
