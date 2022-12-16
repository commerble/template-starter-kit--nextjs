var webpack = require('webpack');
module.exports = {
  reactStrictMode: false,
  i18n: {
    locales: ['ja-JP'],
    defaultLocale: 'ja-JP',
  },
  webpack: (config, options) => {
    config.plugins.push(new webpack.DefinePlugin({
      __CBPAAS_EP__: "'" + process.env.CBPAAS_EP + "'"
    }))

    return config
  },
}
