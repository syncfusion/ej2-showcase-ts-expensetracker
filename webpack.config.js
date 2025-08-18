var glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  target: "web",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              api: "modern-compiler",
              sassOptions: {
                //If utilize the syncfusion sass files, then use the following line
                includePaths: ["node_modules/@syncfusion"],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
      favicon: "favicon.ico"
    }),
    new HtmlWebpackPlugin({
      filename: "dashboard.html",
      template: "./src/dashboard/dashboard.html",
    }),
    new HtmlWebpackPlugin({
      filename: "expense.html",
      template: "./src/expense/expense.html",
    }),
    new HtmlWebpackPlugin({
      filename: "about.html",
      template: "./src/about/about.html",
    }),
    new HtmlWebpackPlugin({
      filename: "dialog.html",
      template: "./src/expense/dialog.html",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'dist'),
      },
      {
        directory: path.join(__dirname, 'styles'),
        publicPath: '/styles',
      }
    ],
    compress: true,
    port: 9000,
    hot: true,
    liveReload: true,
    open: true,
    historyApiFallback: true,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
        extractComments: false,
    })],
  },
};
