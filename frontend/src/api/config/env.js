export const config = {
  // app-controller
  apiUrl: import.meta.env.VITE_API_URL,
  appEnv: import.meta.env.VITE_APP_ENV,
  testAuth: import.meta.env.VITE_TEST_AUTH === 'false',

  // style-controller
  themeBg: `#${import.meta.env.VITE_THEME_BG}`,
  threeBgSize: Number(import.meta.env.VITE_THREE_BG_SIZE),
  threeBgTopColor: `#${import.meta.env.VITE_THREE_BG_TOP_COLOR}`,
  threeBgBottomColor: `#${import.meta.env.VITE_THREE_BG_BOTTOM_COLOR}`,

  // system
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

if (!config.apiUrl) {
  throw new Error('VITE_API_URL не определён в .env');
}

if (!config.appEnv) {
  throw new Error('VITE_APP_ENV не определён в .env');
}

if (isNaN(config.threeBgSize)) {
  throw new Error('VITE_THREE_BG_SIZE должен быть числом');
}

if (!config.themeBg) {
  throw new Error('VITE_THEME_BG обязателен');
}

if (!config.threeBgTopColor || !config.threeBgBottomColor) {
  throw new Error('VITE_THREE_BG_TOP_COLOR и VITE_THREE_BG_BOTTOM_COLOR обязательны');
}

if (config.isDev) {
  console.log('App Config:', {
    apiUrl: config.apiUrl,
    env: config.appEnv,
    testAuth: config.testAuth,
    threeBgSize: config.threeBgSize,
  });
}