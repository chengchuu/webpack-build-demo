const path = require("path");
const { genCustomConsole } = require("mazey");

const WebpackCon = genCustomConsole("WebpackCon:");
const ENTRY = process.env.ENTRY;
WebpackCon.log(`ENTRY ${ENTRY}`);
const ENTRY_FILE = `./src/${ENTRY}.js` || "./src/index.js";
WebpackCon.log(`ENTRY_PATH ${ENTRY_FILE}`);

const plugins = [];

module.exports = {
  entry: {
    [ENTRY]: ENTRY_FILE,
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "lib"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  plugins,
};
