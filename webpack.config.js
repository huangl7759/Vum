const path = require("path");
module.exports = {
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: []
      },
      {
        test: /\.jsx$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: path.resolve("./src/loaders/test-loader.js"),
            options: {
              modules: true,
              a: 99
            }
          },
          {
            loader: "babel-loader"
          }
        ]
      }
    ]
  }
};
