export interface Config {
  storybookStaticDir: string;
  screenshotOptions?: {
    enabled: boolean;
  };
}

const defaultConfig: Config = {
  storybookStaticDir: './storybook-static',
  screenshotOptions: {
    enabled: false,
  },
};

export const getConfig = (): Config => {
  // In the future, this function can be extended to read config from
  // environment variables or a config file.
  return defaultConfig;
};
