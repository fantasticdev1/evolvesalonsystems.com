const path = require('path');

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackRequireFrom = require('webpack-require-from');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const BUILD_DIR = path.join(__dirname, process.env.npm_package_config_build_dir);

const isProduction = process.env.NODE_ENV === 'production';
const analyzeBundle = process.env.npm_package_config_analyze === 'true';

const extractCSS = new ExtractTextPlugin('[name].css');

module.exports = env => {
  const plugins = [];

  plugins.push(
    extractCSS,
    new WebpackRequireFrom({
      methodName: '__cdnUrl'
    })
  );

  if (analyzeBundle) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  return {
    entry: {
      vendor: './src/vendor'
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].[chunkhash:3].js',
      publicPath: '',
      path: `${BUILD_DIR}/styles`
    },
    devtool: false,
    bail: true,
    stats: {
      modules: false,
      hash: false,
      assetsSort: '!size',
      children: false
    },
    externals: {
      jquery: 'window.jQuery',
      $: 'window.jQuery',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: `${__dirname}/src`,
          exclude: `${__dirname}/node_modules`,
          loader: 'babel-loader?retainLines=true&cacheDirectory'
        },
        {
          test: /(\.css|\.scss|\.sass)$/,
          use: extractCSS.extract({
            fallback: 'style-loader',
            use: ['cache-loader', 'css-loader?url=false', 'postcss-loader', 'sass-loader']
          })
        },
        {
          test: /\.gif$/,
          use: ['file-loader?name=[name].gif']
        },
        {
          test: /\.(eot|ttf|otf|svg|woff(2))?$/,
          loader: 'file-loader?name=fonts/[name].[ext]'
        }
      ]
    },
    plugins: plugins,
    mode: isProduction ? 'production' : 'development'
  };
};
