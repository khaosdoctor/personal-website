const { existsSync } = require('fs');

module.exports = {
  server: true,
  // Reload on source edits and on whatever a --watch rebake writes (note pages, feeds)
  files: ['css/*.css', 'js/*.js', '*.html', 'gear/*.html', 'builds/*.html', '*.xml', 'data/**/*'],
  port: 3456,
  open: false,
  middleware: [
    (req, _res, next) => {
      if (!req.url.includes('.') && req.url !== '/') {
        const file = `.${req.url}.html`;
        if (existsSync(file)) req.url += '.html';
      }
      next();
    },
  ],
};
