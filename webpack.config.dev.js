const { merge } = require("webpack-merge");
const baseConf = require("./webpack.config.base");
const path = require("path");

module.exports = merge(baseConf, { /* Development Configuration */
  mode: "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "lib"),
    },
    compress: true,
    port: 9202,
  },
});
