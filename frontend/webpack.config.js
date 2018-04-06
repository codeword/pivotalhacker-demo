var path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: path.join(__dirname, '.'),
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: ['babel-preset-env', 'babel-preset-react']
        }
      }
    ]
  }
};
