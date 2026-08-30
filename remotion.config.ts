import { Config } from '@remotion/cli/config';

Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      fallback: {
        ...currentConfiguration.resolve?.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        child_process: false,
        http: false,
        https: false,
        stream: false,
        zlib: false
      }
    }
  };
});
