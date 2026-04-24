import express from "express";
import https from "https";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Simple proxy to stream audio from Google Drive
  app.get("/api/audio/:id", (req, res) => {
    const fileId = req.params.id;
    const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    https.get(initialUrl, (initRes) => {
      if (initRes.statusCode === 303 || initRes.statusCode === 302 || initRes.statusCode === 301) {
        const redirectUrl = initRes.headers.location;
        if (!redirectUrl) return res.status(404).send('Not Found');
        
        const options = {
          headers: {} as Record<string, string>
        };
        if (req.headers.range) {
          options.headers['range'] = req.headers.range;
        }

        https.get(redirectUrl, options, (audioRes) => {
          res.status(audioRes.statusCode || 200);
          
          // Filter headers that might cause CORS or CORP issues
          const headersToSet = ['content-type', 'content-length', 'accept-ranges', 'content-range'];
          headersToSet.forEach(h => {
             if (audioRes.headers[h]) res.setHeader(h, audioRes.headers[h] as string);
          });
          
          audioRes.pipe(res);
        }).on('error', (err) => {
          res.status(500).send(err.message);
        });
      } else {
        res.status(500).send('Unexpected response from Google Drive');
      }
    }).on('error', (err) => {
      res.status(500).send(err.message);
    });
  });

  if (process.env.NODE_ENV !== "production" && !process.env.K_SERVICE) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
