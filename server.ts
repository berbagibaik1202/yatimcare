import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'YatimCare API System',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Example API info endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      appName: 'YatimCare - Sistem Informasi Yayasan Yatim Piatu',
      foundation: 'Yayasan Peduli YatimCare Indonesia',
      location: 'Kabupaten Sumedang, Jawa Barat',
      modules: [
        'Data Anak & Wali',
        'Verifikasi & Survei Lapangan',
        'Peta Lokasi Leaflet',
        'Kelola Donatur & Donasi',
        'Pengeluaran Dana & Buku Kas',
        'Penyaluran Bantuan',
        'Laporan Keuangan Transparan',
        'Audit Log Aktivitas'
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[YatimCare Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start YatimCare server:', err);
});
