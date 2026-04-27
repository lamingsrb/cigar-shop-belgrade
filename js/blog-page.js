// Blog page entry — minimal bootstrap (i18n + blog rendering)
import { initI18n } from './i18n.js';
import { initBlogPage } from './blog.js';

(async function bootstrap() {
  await initI18n();
  await initBlogPage();
})();
