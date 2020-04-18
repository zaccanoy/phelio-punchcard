/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './example/index.html',
  plugins: [new HtmlWebpackPlugin({ title: 'Example App' })],
  devtool: 'inline-source-map',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'example-build'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'example-build'),
  },
};
