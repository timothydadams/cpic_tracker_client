const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  const isServed = !!env?.WEBPACK_SERVE || false;

  return {
    context: __dirname,
    entry: path.resolve(__dirname, 'src', 'index.js'),
    devtool: isDev ? 'inline-source-map' : false,
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      filename: 'js/[name].[contenthash].bundle.js',
    },

    // Determine how modules within the project are treated
    module: {
      rules: [
        // JavaScript: Use Babel to transpile JavaScript files
        {
          test: /\.(js|jsx)$/i,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: [
                isDev && isServed && require('react-refresh/babel'),
              ].filter(Boolean),
            },
          },
        },
        //MARKDOWN FILE IMPORTS
        {
          test: /\.md$/,
          use: 'raw-loader',
        },
        // Styles: Inject CSS into the head with source maps
        {
          test: /\.(sass|css|scss)$/,
          //exclude:/node_modules/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        },

        {
          test: /\.(woff(2)?|eot|ttf|otf)$/,
          type: 'asset',
          generator: {
            filename: 'static/fonts/[hash][ext][query]',
          },
        },
        {
          test: /\.(png|jpg|jpeg|gif)?$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/images/[hash][ext][query]',
          },
        },
        {
          test: /\.svg$/,
          oneOf: [
            {
              dependency: { not: ['url'] },
              use: ['@svgr/webpack', 'new-url-loader'],
            },
            {
              type: 'asset', // Use 'asset/resource' for file-loader
            },
          ],
        },
      ],
    },

    resolve: {
      extensions: ['.ts', '.js', '.jsx'],
      alias: {
        components: path.resolve(__dirname, 'src/components/'),
        hooks: path.resolve(__dirname, 'src/hooks/'),
        catalyst: path.resolve(__dirname, 'src/components/catalyst/'),
        utils: path.resolve(__dirname, 'src/utils/'),
        assets: path.resolve(__dirname, 'src/assets/'),
        lib: path.resolve(__dirname, 'src/lib/'),
        ui: path.resolve(__dirname, 'src/components/ui'),

        // Other aliases
      },
      fallback: {
        buffer: require.resolve('buffer'),
        //fs:false,
        //crypto:false,
        //path:false,
        //os:false,
      },
    },

    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new Dotenv(),
      isDev && isServed && new ReactRefreshPlugin(),
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src', 'assets'),
            to: path.resolve(__dirname, 'dist', 'assets'),
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['*.DS_Store'],
            },
          },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: 'styles/[name].[contenthash].css',
        chunkFilename: '[id].css',
      }),
      new HtmlWebpackPlugin({
        fileName: 'index.html',
        template: path.resolve(__dirname, 'public', 'index.html'),
        scriptLoading: 'blocking',
      }),
    ].filter(Boolean),

    ...(isDev === false && {
      optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
        runtimeChunk: {
          name: 'runtime',
        },
      },
      performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      },
    }),

    ...(isServed === true && {
      devServer: {
        historyApiFallback: true,
        static: {
          directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 3000,
        //headers: {
        //  "Access-Control-Allow-Origin": "*",
        //  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        //  "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        //},
        proxy: [
          {
            context: ['/api/*'],
            target: 'http://localhost:3500',
          },
        ],
        allowedHosts: ['http://localhost:3500', 'http://127.0.0.1:3500'],
      },
    }),
  };
};
