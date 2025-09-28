const IS_PRODUCTION = false;

export const BASE_URL = IS_PRODUCTION
  ? 'https://www.thestickyapp.com'
  : 'http://localhost:3008';

export const API_BASE_URL = `${BASE_URL}/api`;