const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: './src/editor.js',
    editable: './examples/editable/main.js',
    styleeditor: './examples/styleeditor/main.js',
  },
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['main', 'editable'],
      template: './examples/editable/index.html',
      filename: 'editable.html'
    }),
    new HtmlWebpackPlugin({
      chunks: ['main', 'styleeditor'],
      template: './examples/styleeditor/index.html',
      filename: 'styleeditor.html'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ '@babel/preset-env' ]
          }
        },
      },
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'},
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  resolve: {
    symlinks: false,
    modules: [path.resolve('node_modules')],
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  }
};
