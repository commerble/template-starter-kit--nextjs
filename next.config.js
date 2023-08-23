var webpack = require('webpack');
var path = require('path');
module.exports = {
  reactStrictMode: false,
  i18n: {
    locales: ['ja-JP'],
    defaultLocale: 'ja-JP',
  },
  webpack: (config, { dev, isServer }) => {
    config.plugins.push(new webpack.DefinePlugin({
      __CBPAAS_EP__: "'" + process.env.CBPAAS_EP + "'",
      __BFF_API_PATH__: "'" + process.env.BFF_API_PATH + "'",
    }))

    // why did you render
    if (dev && !isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const wdrPath = path.resolve(__dirname, './utils/wdyr.js')
        const entries = await originalEntry();
        if (entries['main.js'] && !entries['main.js'].includes(wdrPath)) {
          entries['main.js'].unshift(wdrPath);
        }
        return entries;
      };
    }

    return config
  },
}
