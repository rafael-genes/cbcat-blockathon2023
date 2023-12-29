var webpack = require('webpack');
const npm_package = require('./package.json')

const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// const CopyPlugin = require('copy-webpack-plugin');

// Object.keys(npm_package._moduleAliases).forEach(key => {
//   const dir = npm_package._moduleAliases[key];
//   npm_package._moduleAliases[key] = `${__dirname}/${dir}`;
// });
const WebPackIgnorePlugin =
{
  checkResource: function(resource)
  {
    const lazyImports =
    [
        '@nestjs/microservices',
        '@nestjs/microservices/microservices-module',
        '@nestjs/websockets/socket-module',
        'cache-manager',
        'class-transformer',
        'class-transformer/storage',
        'class-validator',
        'fastify-static',
    ];
  
    if (!lazyImports.includes(resource))
      return false;

    try
    {
      require.resolve(resource);
    }
    catch (err)
    {
      return true;
    }
  
    return false;
  }
};

module.exports = {
  context: __dirname,
  mode: 'production',
  entry: slsw.lib.entries,
  devtool: 'source-map',
  // devtool: slsw.lib.webpack.isLocal ? 'cheap-module-eval-source-map' : 'source-map',
  optimization: {
    minimize: false
  },
  resolve: {
    // alias: npm_package._moduleAliases,
    extensions: ['.mjs', '.json', '.ts'],
    symlinks: false,
    cacheWithContext: false,
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      // Uncomment to lint during build. It will break deploys unless code is P-E-R-F-E-C-T.
      // {
      //   enforce: 'pre',
      //   test: /\.(ts)|(tsx)$/,
      //   exclude: /node_modules/,
      //   loader: 'eslint-loader',
      // },

      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)$/,
        loader: 'ts-loader',
        exclude: [
          [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '.serverless'),
            path.resolve(__dirname, '.webpack'),
          ],
        ],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
  plugins:
  [
    new CleanWebpackPlugin(),
    new webpack.IgnorePlugin(WebPackIgnorePlugin),
  ],
  /* plugins: [
    new CopyPlugin([
      {rom: '*.json', to: '/'},
    ]),
  ], */
};