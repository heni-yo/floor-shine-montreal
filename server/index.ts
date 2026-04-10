import './load-env.js';
import { createApp, ensureUploadDirs } from './app.js';

const BASE_PORT = Number(process.env.PORT || 3001);
const MAX_PORT_TRIES = 10;

ensureUploadDirs();
const app = createApp();

function listenWithFallback(startPort: number) {
  let port = startPort;
  let tries = 0;

  const server = app.listen(port, () => {
    console.log(`API soumission écoute sur le port ${port}`);
  });

  server.on('error', (err: unknown) => {
    const e = err as NodeJS.ErrnoException;
    if (e.code === 'EADDRINUSE' && tries < MAX_PORT_TRIES) {
      tries += 1;
      port += 1;
      console.warn(`Port ${port - 1} occupé, essai sur le port ${port}...`);
      server.close(() => {
        listenWithFallback(port);
      });
      return;
    }
    throw err;
  });
}

listenWithFallback(BASE_PORT);
