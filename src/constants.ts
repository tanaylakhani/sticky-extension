const IS_PRODUCTION = false;

export const BASE_URL = IS_PRODUCTION
  ? 'https://sticky-staging-web.vercel.app'
  : 'http://localhost:3008';

export const API_BASE_URL = `${BASE_URL}/api`;
