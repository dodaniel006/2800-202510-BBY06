import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';

const router = Router();

// Needed to resolve relative paths in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/download/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "../frontend/assets/files", fileName);

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(404).json({ error: 'File not found or download failed' });
    }
  });
});
export default router;
