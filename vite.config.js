import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  // GitHub Pages: site se servira iz /cigar-shop-belgrade/ subpath-a.
  // Vercel/Netlify: base ostaje "/" (env var nije set).
  base: process.env.GITHUB_PAGES ? '/cigar-shop-belgrade/' : '/',
  server: {
    port: 5174,
    open: true,
    host: true,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          leaflet: ['leaflet']
        }
      }
    }
  }
});
