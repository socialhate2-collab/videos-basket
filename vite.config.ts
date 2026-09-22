import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'railway-cors-proxy',
        configureServer(server) {
          const FALLBACK_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="o" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="url(#g)"/>
  <circle cx="150" cy="115" r="50" fill="url(#o)"/>
  <path d="M75,260 C75,190 110,185 150,185 C190,185 225,190 225,260 Z" fill="url(#o)"/>
  <circle cx="150" cy="115" r="50" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
  <text x="150" y="285" font-family="system-ui,sans-serif" font-weight="900" font-size="16" fill="#f97316" text-anchor="middle" letter-spacing="2">BASKETDATA</text>
</svg>`;

          // Temporary download file cache for direct top-level downloads outside iframe
          const downloadCache = new Map<string, { path: string; name: string; mime: string; expiry: number }>();

          // Clean expired files every 10 minutes
          setInterval(() => {
            const now = Date.now();
            for (const [key, item] of downloadCache.entries()) {
              if (item.expiry < now) {
                try { if (fs.existsSync(item.path)) fs.unlinkSync(item.path); } catch {}
                downloadCache.delete(key);
              }
            }
          }, 10 * 60 * 1000);

          server.middlewares.use(async (req, res, next) => {
            // Direct file download endpoint (works via target="_blank" in top-level browser tab)
            if (req.url && req.url.startsWith('/api/download-file')) {
              if (req.method === 'OPTIONS') {
                res.statusCode = 204;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', '*');
                res.end();
                return;
              }

              const parsedUrl = new URL(req.url, 'http://localhost:3000');
              const fileId = parsedUrl.searchParams.get('id');
              const item = fileId ? downloadCache.get(fileId) : null;

              if (!item || !fs.existsSync(item.path)) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(`
                  <div style="font-family:system-ui;padding:40px;text-align:center;background:#0f172a;color:#fff;min-height:100vh">
                    <h2 style="color:#f97316">Archivo de vídeo no disponible o expirado</h2>
                    <p style="color:#94a3b8">Por favor, vuelve a la aplicación BasketData Studio y pulsa "Exportar Vídeo".</p>
                  </div>
                `);
                return;
              }

              const fileBuffer = fs.readFileSync(item.path);
              res.statusCode = 200;
              res.setHeader('Content-Type', item.mime || 'video/mp4');
              res.setHeader('Content-Disposition', `attachment; filename="${item.name}"`);
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Content-Length', fileBuffer.length);
              res.end(fileBuffer);
              return;
            }

            // Save temporary video from client (for fallback WebM or client generated files)
            if (req.url && req.url.startsWith('/api/save-temp-video')) {
              if (req.method === 'OPTIONS') {
                res.statusCode = 204;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', '*');
                res.end();
                return;
              }

              if (req.method === 'POST') {
                const parsedUrl = new URL(req.url, 'http://localhost:3000');
                const filename = parsedUrl.searchParams.get('filename') || 'basketdata-video.webm';
                const mime = req.headers['content-type'] || 'video/webm';
                const chunks: Buffer[] = [];

                req.on('data', (c) => chunks.push(c));
                req.on('end', () => {
                  const inputBuf = Buffer.concat(chunks);
                  const downloadId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
                  const ext = filename.endsWith('.mp4') ? 'mp4' : 'webm';
                  const filePath = path.join(os.tmpdir(), `${downloadId}.${ext}`);
                  fs.writeFileSync(filePath, inputBuf);

                  downloadCache.set(downloadId, {
                    path: filePath,
                    name: filename,
                    mime,
                    expiry: Date.now() + 60 * 60 * 1000,
                  });

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify({
                    success: true,
                    downloadId,
                    downloadUrl: `/api/download-file?id=${downloadId}&filename=${encodeURIComponent(filename)}`
                  }));
                });
                return;
              }
            }

            // Handle transcode to MP4 for Social Media (Reels / TikTok / Instagram)
            if (req.url && req.url.startsWith('/api/transcode-mp4')) {
              if (req.method === 'OPTIONS') {
                res.statusCode = 204;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
                res.end();
                return;
              }

              if (req.method === 'POST') {
                const parsedUrl = new URL(req.url, 'http://localhost:3000');
                const bgMusic = parsedUrl.searchParams.get('bgMusic');
                const outName = parsedUrl.searchParams.get('filename') || 'basketdata-ranking.mp4';

                const chunks: Buffer[] = [];
                req.on('data', (chunk) => chunks.push(chunk));
                req.on('error', (err) => {
                  console.error('Request stream error in transcode:', err);
                  if (!res.headersSent) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Error en la transmisión de datos' }));
                  }
                });
                req.on('end', async () => {
                  const inputBuffer = Buffer.concat(chunks);
                  if (inputBuffer.length === 0) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'El archivo de vídeo enviado está vacío' }));
                    return;
                  }

                  const tempId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                  const tempInput = path.join(os.tmpdir(), `bd_in_${tempId}.webm`);
                  const tempOutput = path.join(os.tmpdir(), `bd_out_${tempId}.mp4`);

                  try {
                    fs.writeFileSync(tempInput, inputBuffer);

                    // Check if background music exists
                    let soundPath: string | null = null;
                    if (bgMusic && bgMusic !== 'none') {
                      const candidate = path.resolve(process.cwd(), `public/sounds/music-${bgMusic}.wav`);
                      if (fs.existsSync(candidate)) {
                        soundPath = candidate;
                      }
                    }

                    // Build ffmpeg command with ultra-fast preset and full multithreading to avoid hanging
                    let cmd: string;
                    if (soundPath) {
                      cmd = `ffmpeg -y -nostdin -i "${tempInput}" -stream_loop -1 -i "${soundPath}" -c:v libx264 -preset ultrafast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart -threads 0 "${tempOutput}"`;
                    } else {
                      cmd = `ffmpeg -y -nostdin -i "${tempInput}" -c:v libx264 -preset ultrafast -crf 20 -pix_fmt yuv420p -map 0:v:0 -map 0:a? -c:a aac -b:a 192k -ar 44100 -movflags +faststart -threads 0 "${tempOutput}"`;
                    }

                    exec(cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 30000 }, (err) => {
                      if (err || !fs.existsSync(tempOutput)) {
                        console.error('FFmpeg transcode error or timeout:', err);
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Error durante la transcodificación MP4', details: err?.message }));
                        // Cleanup
                        try { if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput); } catch {}
                        try { if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput); } catch {}
                        return;
                      }

                      const outBuffer = fs.readFileSync(tempOutput);

                      // Store in download cache for direct downloads (available for 1 hour)
                      const downloadId = `mp4_${tempId}`;
                      downloadCache.set(downloadId, {
                        path: tempOutput,
                        name: outName,
                        mime: 'video/mp4',
                        expiry: Date.now() + 60 * 60 * 1000,
                      });
                      const dlUrl = `/api/download-file?id=${downloadId}&filename=${encodeURIComponent(outName)}`;

                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'video/mp4');
                      res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
                      res.setHeader('Access-Control-Allow-Origin', '*');
                      res.setHeader('Access-Control-Expose-Headers', 'X-Download-Id, X-Download-Url, Content-Disposition');
                      res.setHeader('X-Download-Id', downloadId);
                      res.setHeader('X-Download-Url', dlUrl);
                      res.setHeader('Content-Length', outBuffer.length);
                      res.end(outBuffer);

                      // Cleanup input, but keep tempOutput referenced in downloadCache
                      try { if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput); } catch {}
                    });
                  } catch (e: any) {
                    console.error('Transcode exception:', e);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Excepción en transcodificador', details: e?.message }));
                    try { if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput); } catch {}
                    try { if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput); } catch {}
                  }
                });
                return;
              }
            }

            if (req.url && req.url.startsWith('/api/proxy')) {
              // Handle CORS preflight
              if (req.method === 'OPTIONS') {
                res.statusCode = 204;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
                res.end();
                return;
              }

              let isImage = false;
              try {
                const parsedUrl = new URL(req.url, 'http://localhost:3000');
                const targetUrl = parsedUrl.searchParams.get('url');
                
                if (!targetUrl) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Falta el parámetro "url"' }));
                  return;
                }

                isImage = 
                  targetUrl.includes('Foto.aspx') || 
                  targetUrl.includes('imagenes.feb.es') ||
                  Boolean(targetUrl.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i)) ||
                  Boolean(req.headers['accept'] && req.headers['accept'].includes('image'));

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 12000);

                const headers: Record<string, string> = {
                  'User-Agent': isImage 
                    ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                    : 'BasketData-Studio/2.0',
                  'Accept': isImage
                    ? 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                    : (req.headers['accept'] || 'application/json')
                };

                if (isImage) {
                  headers['Referer'] = 'https://competiciones.feb.es/';
                }
                
                const authHeader = req.headers['authorization'];
                if (authHeader) {
                  headers['Authorization'] = String(authHeader);
                }

                const response = await fetch(targetUrl, {
                  method: req.method || 'GET',
                  headers,
                  signal: controller.signal
                });
                clearTimeout(timeoutId);

                // If image returned 404 from upstream FEB, return our elegant fallback avatar
                if (isImage && !response.ok) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'image/svg+xml');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.setHeader('Cache-Control', 'public, max-age=3600');
                  res.end(FALLBACK_AVATAR_SVG);
                  return;
                }

                res.statusCode = response.status;
                const contentType = response.headers.get('content-type') || (isImage ? 'image/jpeg' : 'application/json');
                res.setHeader('Content-Type', contentType);
                res.setHeader('Access-Control-Allow-Origin', '*');
                if (isImage) {
                  res.setHeader('Cache-Control', 'public, max-age=86400');
                }

                // CRITICAL: Fetch binary arrayBuffer and pipe as Buffer to preserve image bytes
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                res.setHeader('Content-Length', buffer.length);
                res.end(buffer);
                return;
              } catch (err: any) {
                if (isImage) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'image/svg+xml');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(FALLBACK_AVATAR_SVG);
                  return;
                }
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  error: 'Proxy Error', 
                  message: err.name === 'AbortError' ? 'Timeout conectando a Railway (>12s, servidor en reposo)' : err.message 
                }));
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
