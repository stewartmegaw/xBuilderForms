/*
  Project specific configuration for Webpack
  Only a minified production build will be produced
 */

module.exports = function(env) {
  let webpack = require("webpack");
  let path = require("path");
  let ExtractTextPlugin = require("extract-text-webpack-plugin");

  let buildPath = path.resolve(__dirname, "./dist/webpack/");

  let client_plugins = [];

  // This module is used for CSS Modules
  client_plugins.push(
    new ExtractTextPlugin({
      filename: "[name].css",
      disable: false,
      allChunks: true
    })
  );

  if (env.prod !== "1") {
    client_plugins.push(
      new webpack.DefinePlugin({
        // MUI requires this to be consistent between client and server
        "process.env.NODE_ENV": JSON.stringify("development")
      })
    );
  } else {
    // Declare environment as production
    client_plugins.push(
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production")
      })
    );

    // Minimize the output files production
    client_plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          warnings: false // Suppress uglification warnings
        },
        output: {
          comments: false
        },
        exclude: [/\.min\.js$/gi] // skip pre-minified libs
      })
    );
    // Merge chunks in production
    client_plugins.push(new webpack.optimize.AggressiveMergingPlugin());
  }
  let config = {
    target: "web",
    // Entry points to the project
    entry: ["react", "./src/main.js"],
    // Config options on how to interpret requires imports
    resolve: {
      extensions: [".js", ".jsx"],
      symlinks: false
    },
    devtool: env.prod === "1" ? "" : "source-map",
    output: {
      path: __dirname + "/dist", // Path of output file
      filename: "bundle.min.js"
    },
    plugins: client_plugins,
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/, // All .js and .jsx files
          loader: "babel-loader"
        },

        {
          test: /\.inject\.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: "css-loader?style-loader"
          })
        },
        {
          test: /\.css$/,
          exclude: /\.inject\.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: "css-loader"
          })
        }
      ]
    }
  };

  return (module.exports = config);
};
