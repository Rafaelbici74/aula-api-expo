const { withAndroidManifest } = require('@expo/config-plugins');

function withAndroidCleartextTraffic(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) {
      throw new Error('Android manifest is missing its application element.');
    }

    application.$ = {
      ...application.$,
      'android:usesCleartextTraffic': 'true',
    };

    return config;
  });
}

module.exports = withAndroidCleartextTraffic;
