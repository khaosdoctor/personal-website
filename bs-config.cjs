const { existsSync } = require('fs');

module.exports = {
  server: true,
  files: ['css/*.css', 'js/*.js', '*.html', 'data/**/*'],
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
