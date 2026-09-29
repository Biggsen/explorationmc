const browserSync = require("browser-sync").create();

browserSync.init({
  server: ".",
  port: Number(process.env.PORT) || 47291,
  files: ["index.html", "styles.css", "images/**/*"],
  open: false,
  notify: false,
  ghostMode: false,
  ui: {
    port: 47292,
  },
});
