// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://moatrics.com — marketing site
// `app.moatrics.com` is the authenticated Streamlit app.
export default defineConfig({
  site: 'https://moatrics.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    tailwind({
      // We provide a global base stylesheet ourselves (with all `--mx-*`
      // tokens), so let Tailwind add its preflight/utilities on top.
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
