var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_https = __toESM(require("https"), 1);
var import_path = __toESM(require("path"), 1);
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3001;
  app.get("/api/audio/:id", (req, res) => {
    const fileId = req.params.id;
    const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    import_https.default.get(initialUrl, (initRes) => {
      if (initRes.statusCode === 303 || initRes.statusCode === 302 || initRes.statusCode === 301) {
        const redirectUrl = initRes.headers.location;
        if (!redirectUrl) return res.status(404).send("Not Found");
        const options = {
          headers: {}
        };
        if (req.headers.range) {
          options.headers["range"] = req.headers.range;
        }
        import_https.default.get(redirectUrl, options, (audioRes) => {
          res.status(audioRes.statusCode || 200);
          const headersToSet = ["content-type", "content-length", "accept-ranges", "content-range"];
          headersToSet.forEach((h) => {
            if (audioRes.headers[h]) res.setHeader(h, audioRes.headers[h]);
          });
          audioRes.pipe(res);
        }).on("error", (err) => {
          res.status(500).send(err.message);
        });
      } else {
        res.status(500).send("Unexpected response from Google Drive");
      }
    }).on("error", (err) => {
      res.status(500).send(err.message);
    });
  });
  if (process.env.NODE_ENV !== "production" && !process.env.K_SERVICE) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
