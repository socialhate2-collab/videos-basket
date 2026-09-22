import { toCanvas, toPng } from 'html-to-image';

export interface ExportProgress {
  percent: number;
  currentFrame: number;
  totalFrames: number;
  phase: 'preparing' | 'capturing' | 'transcoding' | 'ready';
  message: string;
  previewDataUrl?: string;
}

export interface VideoExportOptions {
  containerElement: HTMLElement;
  playerRef: any; // PlayerRef from @remotion/player
  durationInFrames: number;
  width: number;
  height: number;
  fps?: number;
  format?: 'mp4' | 'webm';
  quality?: 'ultra' | 'high' | 'standard';
  bgMusic?: 'energetic' | 'hiphop' | 'epic' | 'chill' | 'none';
  filename?: string;
  onProgress?: (progress: ExportProgress) => void;
  shouldCancel?: () => boolean;
}

export interface ExportResult {
  success: boolean;
  blob: Blob;
  url: string;
  serverDownloadUrl?: string;
  format: 'mp4' | 'webm';
  filename: string;
  error?: string;
}

// Find optimal supported mime type for MediaRecorder in browser
export const getBestMediaRecorderMimeType = (): string => {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=h264',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm',
  ];

  if (typeof MediaRecorder === 'undefined') {
    return 'video/webm';
  }

  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }

  return 'video/webm';
};

/**
 * Helper to locate the exact Remotion composition container node inside the Player.
 * The Remotion Player wraps the composition in an internal container (__remotion-player)
 * which has a CSS scale() transform applied to fit the preview UI.
 */
export function getRemotionCompositionNode(container: HTMLElement, width: number, height: number): HTMLElement {
  // 1. Look for the Remotion player internal container
  const remotionPlayer = container.querySelector('.__remotion-player') as HTMLElement;
  if (remotionPlayer) {
    return remotionPlayer;
  }

  // 2. Look for element with transform scale or matching composition dimensions
  const allDivs = Array.from(container.querySelectorAll('div'));
  const scaledDiv = allDivs.find((d) => {
    const s = d.style;
    if (!s) return false;
    const hasTransform = Boolean(s.transform && s.transform.includes('scale'));
    const hasExactDims = (s.width === `${width}px` || s.width === `${width}`) &&
                         (s.height === `${height}px` || s.height === `${height}`);
    return hasTransform || hasExactDims;
  });

  if (scaledDiv) {
    return scaledDiv;
  }

  // 3. Fallback: data-remotion-canvas or position: absolute container
  const canvasAttr = container.querySelector('[data-remotion-canvas]') as HTMLElement;
  if (canvasAttr) return canvasAttr;

  const absDiv = container.querySelector('div[style*="position: absolute"]') as HTMLElement;
  if (absDiv) return absDiv;

  return container;
}

/**
 * Capture Remotion Player frames and export as high-quality Social Media MP4 or WebM
 */
export async function exportSocialVideo(options: VideoExportOptions): Promise<ExportResult> {
  const {
    containerElement,
    playerRef,
    durationInFrames,
    width,
    height,
    fps = 30,
    format = 'mp4',
    quality = 'ultra',
    bgMusic = 'energetic',
    filename = 'ranking-basketdata-social.mp4',
    onProgress,
    shouldCancel,
  } = options;

  if (!containerElement || !playerRef?.current) {
    throw new Error('El reproductor no está inicializado o no se encontró el contenedor');
  }

  onProgress?.({
    percent: 0,
    currentFrame: 0,
    totalFrames: durationInFrames,
    phase: 'preparing',
    message: 'Inicializando motor de renderizado de alta calidad (1080x1920)...',
  });

  // Pause player to control frame-by-frame seeking
  try {
    playerRef.current.pause();
  } catch {}

  // Find exact composition DOM element inside player
  const targetNode = getRemotionCompositionNode(containerElement, width, height);

  // Preserve original inline styles so we can restore them in finally
  const originalTransform = targetNode.style.transform;
  const originalTransformOrigin = targetNode.style.transformOrigin;
  const originalMarginLeft = targetNode.style.marginLeft;
  const originalMarginTop = targetNode.style.marginTop;
  const originalMargin = targetNode.style.margin;
  const originalLeft = targetNode.style.left;
  const originalTop = targetNode.style.top;
  const originalWidth = targetNode.style.width;
  const originalHeight = targetNode.style.height;
  const originalPosition = targetNode.style.position;

  // Temporarily normalize targetNode to unscaled composition dimensions
  targetNode.style.transform = 'none';
  targetNode.style.transformOrigin = '0 0';
  targetNode.style.marginLeft = '0px';
  targetNode.style.marginTop = '0px';
  targetNode.style.margin = '0px';
  targetNode.style.left = '0px';
  targetNode.style.top = '0px';
  targetNode.style.width = `${width}px`;
  targetNode.style.height = `${height}px`;
  targetNode.style.position = 'absolute';

  // Create recording canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D del Canvas');
  }

  // Bitrates based on quality selection (optimized for fast social upload & crisp 1080p)
  const bitrates = {
    ultra: 12_000_000,   // 12 Mbps: Ultra HD social export (crystal clear for Instagram/TikTok)
    high: 8_000_000,     // 8 Mbps: High quality 1080p
    standard: 5_000_000, // 5 Mbps: Standard web
  };
  const videoBitsPerSecond = bitrates[quality] || bitrates.ultra;

  const mimeType = getBestMediaRecorderMimeType();
  const stream = canvas.captureStream(fps);

  let mediaRecorder: MediaRecorder;
  try {
    mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond,
    });
  } catch {
    mediaRecorder = new MediaRecorder(stream);
  }

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const recordedBlob = new Blob(chunks, { type: mimeType });
      resolve(recordedBlob);
    };
    mediaRecorder.onerror = (e) => reject(e);
  });

  mediaRecorder.start(200); // 200ms slice chunks

  // Ensure document fonts are resolved before starting capture
  if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch {
      // Continue safely if fonts API unavailable
    }
  }

  // Render loop
  const totalFrames = durationInFrames;
  let previewDataUrl: string | undefined;

  try {
    for (let frame = 0; frame < totalFrames; frame++) {
      if (shouldCancel && shouldCancel()) {
        mediaRecorder.stop();
        throw new Error('Exportación cancelada por el usuario');
      }

      // Seek player to exact frame
      try {
        playerRef.current.seekTo(frame);
      } catch (e) {
        console.warn('Seek error at frame', frame, e);
      }

      // Wait a brief tick for React to finish rendering DOM updates
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 16));

      // Capture DOM node to canvas at full 9:16 resolution
      try {
        const frameCanvas = await toCanvas(targetNode, {
          width,
          height,
          canvasWidth: width,
          canvasHeight: height,
          pixelRatio: 1,
          cacheBust: false,
          skipFonts: true,
          fontEmbedCSS: '',
          style: {
            transform: 'none',
            transformOrigin: '0 0',
            marginLeft: '0px',
            marginTop: '0px',
            margin: '0px',
            left: '0px',
            top: '0px',
            width: `${width}px`,
            height: `${height}px`,
            position: 'absolute',
          },
          filter: (node) => {
            // Exclude player controls and overlays
            if (node.classList && (
              node.classList.contains('remotion-player-controls') ||
              node.classList.contains('warning-banner') ||
              (node as HTMLElement).tagName === 'INPUT' ||
              (node as HTMLElement).tagName === 'BUTTON'
            )) {
              return false;
            }
            return true;
          },
        });

        ctx.drawImage(frameCanvas, 0, 0, width, height);

        // Generate preview thumbnail every 15 frames
        if (frame % 15 === 0 || frame === totalFrames - 1) {
          previewDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        }
      } catch (renderErr) {
        console.warn('Error capturing frame', frame, renderErr);
      }

      const pct = Math.round(((frame + 1) / totalFrames) * 85); // 0-85% is frame capture
      onProgress?.({
        percent: pct,
        currentFrame: frame + 1,
        totalFrames,
        phase: 'capturing',
        message: `Renderizando fotograma ${frame + 1} de ${totalFrames} en 1080p (9:16)...`,
        previewDataUrl,
      });
    }

    // Stop recording
    mediaRecorder.stop();
  } finally {
    // Restore original styles on targetNode so player returns to UI preview scale
    try {
      targetNode.style.transform = originalTransform;
      targetNode.style.transformOrigin = originalTransformOrigin;
      targetNode.style.marginLeft = originalMarginLeft;
      targetNode.style.marginTop = originalMarginTop;
      targetNode.style.margin = originalMargin;
      targetNode.style.left = originalLeft;
      targetNode.style.top = originalTop;
      targetNode.style.width = originalWidth;
      targetNode.style.height = originalHeight;
      targetNode.style.position = originalPosition;
    } catch {}
  }

  const rawBlob = await recordingPromise;

  // If user selected WebM directly or server transcode is not requested
  if (format === 'webm') {
    onProgress?.({
      percent: 100,
      currentFrame: totalFrames,
      totalFrames,
      phase: 'ready',
      message: '¡Vídeo WebM generado con éxito!',
      previewDataUrl,
    });

    const url = URL.createObjectURL(rawBlob);
    triggerDownload(url, filename.replace(/\.mp4$/i, '.webm'));
    return {
      success: true,
      blob: rawBlob,
      url,
      format: 'webm',
      filename: filename.replace(/\.mp4$/i, '.webm'),
    };
  }

  // Format is MP4 -> Transcode via server FFmpeg for 100% Social Media Compatibility
  let currentPct = 88;
  onProgress?.({
    percent: currentPct,
    currentFrame: totalFrames,
    totalFrames,
    phase: 'transcoding',
    message: 'Optimizando formato MP4 (H.264 / AAC) para Instagram, TikTok y WhatsApp...',
    previewDataUrl,
  });

  // Animated progress ticker between 88% and 98% so the UI never freezes or looks hung
  const progressTimer = setInterval(() => {
    if (currentPct < 98) {
      currentPct += 2;
      const stepMsg =
        currentPct <= 90
          ? 'Enviando flujo de vídeo al transcodificador...'
          : currentPct <= 94
          ? 'Codificando vídeo MP4 H.264 acelerado por hardware...'
          : 'Sincronizando banda sonora AAC y empaquetando contenedor...';
      onProgress?.({
        percent: currentPct,
        currentFrame: totalFrames,
        totalFrames,
        phase: 'transcoding',
        message: stepMsg,
        previewDataUrl,
      });
    }
  }, 750);

  const finalMp4Name = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;

  // 25s timeout controller to avoid hanging indefinitely if proxy or connection drops
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 25000);

  try {
    const transcodeRes = await fetch(
      `/api/transcode-mp4?bgMusic=${encodeURIComponent(bgMusic)}&filename=${encodeURIComponent(finalMp4Name)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': rawBlob.type || 'video/webm',
        },
        body: rawBlob,
        signal: abortController.signal,
      }
    );

    clearInterval(progressTimer);
    clearTimeout(timeoutId);

    if (!transcodeRes.ok) {
      const errJson = await transcodeRes.json().catch(() => ({}));
      throw new Error(errJson.error || `Error del servidor HTTP ${transcodeRes.status}`);
    }

    const serverDownloadUrl = transcodeRes.headers.get('X-Download-Url') || undefined;
    const mp4Blob = await transcodeRes.blob();
    const mp4Url = URL.createObjectURL(mp4Blob);

    onProgress?.({
      percent: 100,
      currentFrame: totalFrames,
      totalFrames,
      phase: 'ready',
      message: '¡Vídeo MP4 optimizado para redes listo!',
      previewDataUrl,
    });

    triggerDownload(serverDownloadUrl || mp4Url, finalMp4Name);

    return {
      success: true,
      blob: mp4Blob,
      url: mp4Url,
      serverDownloadUrl,
      format: 'mp4',
      filename: finalMp4Name,
    };
  } catch (err: any) {
    clearInterval(progressTimer);
    clearTimeout(timeoutId);

    const isTimeout = err?.name === 'AbortError';
    console.warn('Transcode fallback triggered:', isTimeout ? 'Timeout' : err.message);

    // Guarantee that progress reaches 100% and UI marks as ready
    onProgress?.({
      percent: 100,
      currentFrame: totalFrames,
      totalFrames,
      phase: 'ready',
      message: '¡Vídeo procesado en alta resolución!',
      previewDataUrl,
    });

    // Provide high-quality client video blob immediately
    const fallbackName = filename.replace(/\.mp4$/i, '.webm');
    const fallbackUrl = URL.createObjectURL(rawBlob);

    // Save fallback blob to server in background to generate direct download URL
    let fallbackServerUrl: string | undefined = undefined;
    try {
      const saveRes = await fetch(`/api/save-temp-video?filename=${encodeURIComponent(fallbackName)}`, {
        method: 'POST',
        headers: { 'Content-Type': rawBlob.type || 'video/webm' },
        body: rawBlob,
      });
      if (saveRes.ok) {
        const saveJson = await saveRes.json();
        fallbackServerUrl = saveJson.downloadUrl;
      }
    } catch {}

    triggerDownload(fallbackServerUrl || fallbackUrl, fallbackName);

    return {
      success: true,
      blob: rawBlob,
      url: fallbackUrl,
      serverDownloadUrl: fallbackServerUrl,
      format: 'webm',
      filename: fallbackName,
      error: isTimeout
        ? 'El servidor tardó más de lo esperado; se entregó el vídeo nativo en alta resolución directamente.'
        : `Transcodificación en servidor no disponible (${err.message}). Se entregó el vídeo nativo en alta calidad.`,
    };
  }
}

/**
 * Capture single high-res cover image (1080x1920 or 1920x1080) for Instagram / TikTok cover
 */
export async function exportPosterPng(
  containerElement: HTMLElement,
  filename: string = 'basketdata-portada-ranking.png',
  width: number = 1080,
  height: number = 1920
): Promise<string> {
  const targetNode = getRemotionCompositionNode(containerElement, width, height);

  const originalTransform = targetNode.style.transform;
  const originalTransformOrigin = targetNode.style.transformOrigin;
  const originalMarginLeft = targetNode.style.marginLeft;
  const originalMarginTop = targetNode.style.marginTop;
  const originalMargin = targetNode.style.margin;
  const originalLeft = targetNode.style.left;
  const originalTop = targetNode.style.top;
  const originalWidth = targetNode.style.width;
  const originalHeight = targetNode.style.height;
  const originalPosition = targetNode.style.position;

  let dataUrl: string;
  try {
    targetNode.style.transform = 'none';
    targetNode.style.transformOrigin = '0 0';
    targetNode.style.marginLeft = '0px';
    targetNode.style.marginTop = '0px';
    targetNode.style.margin = '0px';
    targetNode.style.left = '0px';
    targetNode.style.top = '0px';
    targetNode.style.width = `${width}px`;
    targetNode.style.height = `${height}px`;
    targetNode.style.position = 'absolute';

    dataUrl = await toPng(targetNode, {
      width,
      height,
      canvasWidth: width,
      canvasHeight: height,
      pixelRatio: 1,
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: '',
      style: {
        transform: 'none',
        transformOrigin: '0 0',
        marginLeft: '0px',
        marginTop: '0px',
        margin: '0px',
        left: '0px',
        top: '0px',
        width: `${width}px`,
        height: `${height}px`,
        position: 'absolute',
      },
      filter: (node) => {
        if (node.classList && (
          node.classList.contains('remotion-player-controls') ||
          node.classList.contains('warning-banner') ||
          (node as HTMLElement).tagName === 'INPUT' ||
          (node as HTMLElement).tagName === 'BUTTON'
        )) {
          return false;
        }
        return true;
      },
    });
  } finally {
    try {
      targetNode.style.transform = originalTransform;
      targetNode.style.transformOrigin = originalTransformOrigin;
      targetNode.style.marginLeft = originalMarginLeft;
      targetNode.style.marginTop = originalMarginTop;
      targetNode.style.margin = originalMargin;
      targetNode.style.left = originalLeft;
      targetNode.style.top = originalTop;
      targetNode.style.width = originalWidth;
      targetNode.style.height = originalHeight;
      targetNode.style.position = originalPosition;
    } catch {}
  }

  triggerDownload(dataUrl, filename);
  return dataUrl;
}

/**
 * Helper to trigger file download in browser
 */
export function triggerDownload(url: string, filename: string) {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 2000);
  } catch (err) {
    console.warn('triggerDownload exception:', err);
  }
}

/**
 * Social media copy template generator for Instagram / TikTok / X
 */
export function generateSocialPostCopy(params: {
  category: string;
  statName: string;
  topPlayerName: string;
  topPlayerTeam: string;
  topPlayerStat: string | number;
  topPlayers?: Array<{ name: string; team: string; stat: string | number; rank: number }>;
}): string {
  const { category, statName, topPlayerName, topPlayerTeam, topPlayerStat, topPlayers = [] } = params;

  let text = `🔥 ¡RANKING OFICIAL BASKETDATA! 🔥\n\n`;
  text += `🏆 Líder en ${statName} (${category}):\n`;
  text += `⭐ ${topPlayerName} (${topPlayerTeam}) - ${topPlayerStat} ${statName}\n\n`;

  if (topPlayers.length > 1) {
    text += `📊 TOP JUGADORES:\n`;
    topPlayers.forEach((p) => {
      const medal = p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`;
      text += `${medal} ${p.name} (${p.team}) · ${p.stat}\n`;
    });
    text += `\n`;
  }

  text += `📈 Gráficos y analítica avanzada generada con @BasketData\n\n`;
  text += `#BasketData #FEB #LEBOro #LEBPlata #LigaEndesa #Baloncesto #BasketballAnalytics #Ranking #MVP`;

  return text;
}
