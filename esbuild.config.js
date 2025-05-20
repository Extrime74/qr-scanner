// esbuild.config.js
const path = require('path')

module.exports = {
  entryPoints: ['app/javascript/application.js'],
  bundle: true,
  sourcemap: true,
  format: 'esm',
  outdir: 'app/assets/builds',
  publicPath: '/assets',
  loader: {
    '.js': 'jsx'
  },
  external: ['@hotwired/turbo-rails', '@hotwired/stimulus']
}