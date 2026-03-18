export const config = {
  // app-controller
  apiUrl: import.meta.env.VITE_API_URL,
  appEnv: import.meta.env.VITE_APP_ENV,
  testAuth: import.meta.env.VITE_TEST_AUTH === 'false',
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

if (config.isDev) {
  console.log('App Config:', {
    apiUrl: config.apiUrl,
    env: config.appEnv,
    testAuth: config.testAuth,
  });
}