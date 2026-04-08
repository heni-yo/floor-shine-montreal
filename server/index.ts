import 'dotenv/config';
import { createApp, ensureUploadDirs } from './app.js';

const PORT = Number(process.env.PORT || 3001);

ensureUploadDirs();
const app = createApp();
app.listen(PORT, () => {
  console.log(`API soumission écoute sur le port ${PORT}`);
});
