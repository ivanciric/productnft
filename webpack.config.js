const path = require('path');
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  entry: './js/woonft.js', // Entry point of your plugin's script
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'woonft.bundle.js', // Output bundle file
    globalObject: 'window'
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/, // Use babel-loader for .js files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Convert ES6+ to compatible JavaScript
          },
        },
      },
    ],
  },
  resolve: {
    fallback: {

        // Add other fallbacks here if necessary
    }
  }
};
