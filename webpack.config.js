const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'build'),
  },
  devServer: {
    static: './',
    port: 8080,
    open: true,
  },
  plugins: [
    new HtmlWebpackPlugin({template: './index.html'}),
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(sass|less|css)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: () => [
                  require('autoprefixer')
                ]
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
  // module: {
  //   rules: [
  //     {
  //       test: /\.(png|jpe?g|gif)$/i,
  //       use: [
  //         {
  //           loader: 'file-loader',
  //         },
  //       ],
  //     },
  //     {
  //       test: /\.css$/i,
  //       use: ["style-loader", "css-loader", 'postcss-loader', 'sass-loader'],
  //     },
  //     {
  //       test: /\.m?js$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: 'babel-loader',
  //         options: {
  //           presets: [
  //             ['@babel/preset-env', { targets: "defaults" }]
  //           ]
  //         }
  //       }
  //     }
  //   ]
  // },
};