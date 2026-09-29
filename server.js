const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname);
const port = process.env.PORT ? Number(process.env.PORT) : 47291;
const host = "0.0.0.0";

function lanAddresses() {
  const addresses = [];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries || []) {
      const ip4 = entry.family === "IPv4" || entry.family === 4;
      if (ip4 && !entry.internal) addresses.push(entry.address);
    }
  }
  return addresses;
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function send(response, status, body, type) {
  response.writeHead(status, {
    "Content-Type": type || "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  response.end(body);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === "/") pathname = "/index.html";

  const filePath = path.resolve(root, `.${pathname}`);
  const relative = path.relative(root, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    send(response, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    const target = !statError && stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    fs.readFile(target, (readError, data) => {
      if (readError) {
        send(response, 404, "Not found");
        return;
      }
      const type = types[path.extname(target).toLowerCase()] || "application/octet-stream";
      send(response, 200, data, type);
    });
  });
});

server.listen(port, host, () => {
  console.log(`Exploration Servers http://localhost:${port}`);
  for (const address of lanAddresses()) {
    console.log(`On this network http://${address}:${port}`);
  }
});
