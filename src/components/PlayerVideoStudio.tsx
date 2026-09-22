import React, { useState, useRef } from 'react';
import { Player } from '@remotion/player';
import confetti from 'canvas-confetti';
import { 
  Video, 
  Music, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Download, 
  Play, 
  Copy, 
  Check, 
  Shield, 
  Flame, 
  Target, 
  Zap, 
  Eye, 
  EyeOff,
  Radio,
  Share2,
  Upload,
  Trash2
} from 'lucide-react';
import { PlayerVideoIntro, getPlayerVideoDuration } from '../remotion/PlayerVideoIntro';
import { SAMPLE_PLAYERS } from '../data/mockBasketData';
import { MusicStyle, RevealEffect, BadgeColor, RenderJob } from '../types/bdata';
import { getSafePhotoUrl } from '../lib/photoProxy';

interface PlayerVideoStudioProps {
  onQueueRender?: (job: RenderJob) => void;
}

export const PlayerVideoStudio: React.FC<PlayerVideoStudioProps> = ({ onQueueRender }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(SAMPLE_PLAYERS[0]);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicStyle, setMusicStyle] = useState<MusicStyle>('energetic');
  const [badgeColor, setBadgeColor] = useState<BadgeColor>('naranja');
  const [revealEffect, setRevealEffect] = useState<RevealEffect>('confeti');
  const [hideScore, setHideScore] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoName, setCustomVideoName] = useState<string>('');
  
  // Audio preview playback
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Render & Export
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  // Music options
  const MUSIC_OPTIONS: { id: MusicStyle; label: string; desc: string }[] = [
    { id: 'energetic', label: 'Enérgica EDM', desc: 'Ritmo rápido, ideal TikTok' },
    { id: 'hiphop', label: 'Hip-Hop / Trap', desc: '808 y hi-hats urbanos' },
    { id: 'epic', label: 'Épica Orquestal', desc: 'Cinematográfica y heroica' },
    { id: 'chill', label: 'Chill / Lo-Fi', desc: 'Relajada y moderna' },
  ];

  const BADGE_COLORS: { id: BadgeColor; label: string; color: string }[] = [
    { id: 'naranja', label: 'Naranja Marca', color: '#FF6B10' },
    { id: 'verde', label: 'Verde Élite', color: '#16A150' },
    { id: 'azul', label: 'Azul Pro', color: '#2563EB' },
  ];

  const REVEAL_EFFECTS: { id: RevealEffect; label: string; desc: string }[] = [
    { id: 'confeti', label: 'Confeti', desc: 'Lluvia de partículas' },
    { id: 'estrellas', label: 'Estrellas', desc: 'Destellos radiales' },
    { id: 'destello', label: 'Flash Dorado', desc: 'Anillo de luz solar' },
    { id: 'ninguno', label: 'Ninguno', desc: 'Aparición limpia' },
  ];

  // Test sound effect
  const handlePreviewMusic = (style: MusicStyle) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(`/sounds/music-${style}.wav`);
    audioRef.current = audio;
    setIsPlayingAudio(style);
    audio.play().catch(() => {});
    audio.onended = () => setIsPlayingAudio(null);
  };

  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF6B10', '#16A150', '#2563EB', '#F59E0B']
    });
  };

  // Build input props for Remotion PlayerVideoIntro
  const playerProps = {
    player: {
      id: selectedPlayer.id,
      name: selectedPlayer.name,
      cleanName: selectedPlayer.cleanName,
      team: selectedPlayer.team,
      number: selectedPlayer.number,
      position: selectedPlayer.position,
      photo: getSafePhotoUrl(selectedPlayer.photo),
      photo_url: getSafePhotoUrl(selectedPlayer.photo),
      points: selectedPlayer.points,
      rebounds: selectedPlayer.rebounds,
      assists: selectedPlayer.assists,
      steals: selectedPlayer.steals,
      blocks: selectedPlayer.blocks,
      valuation: selectedPlayer.valuation,
      bd_score: selectedPlayer.bd_score,
      trend: selectedPlayer.trend,
      badges: selectedPlayer.badges,
      pts_36: selectedPlayer.pts_36,
      reb_36: selectedPlayer.reb_36,
      ast_36: selectedPlayer.ast_36,
      ts_pct: selectedPlayer.ts_pct,
      stats: {
        puntos: selectedPlayer.points,
        rebotes_total: selectedPlayer.rebounds,
        asistencias: selectedPlayer.assists,
        robos: selectedPlayer.steals,
        tapones_favor: selectedPlayer.blocks,
        valoracion: selectedPlayer.valuation,
      }
    },
    narration: {
      segments: [
        { key: 'intro', duration_ms: 3000, text: `Hoy analizamos a ${selectedPlayer.cleanName}` },
        { key: 'stat_pts', duration_ms: 2200, text: `${selectedPlayer.points} puntos por partido` },
        { key: 'stat_ast', duration_ms: 2200, text: `${selectedPlayer.assists} asistencias` },
        { key: 'stat_val', duration_ms: 2200, text: `${selectedPlayer.valuation} de valoración media` },
        { key: 'closing', duration_ms: 3500, reveal_ms: 1800, text: `Su BD Score definitivo es de ${selectedPlayer.bd_score}` }
      ]
    },
    introVideoSrc: customVideoUrl,
    sfxEnabled,
    musicStyle,
    sfxChoices: {},
    hideScore,
    badgeColor,
    revealEffect,
  };

  const calculatedDuration = getPlayerVideoDuration(playerProps.narration, hideScore);

  const handleExportVideo = () => {
    setIsExporting(true);
    setExportProgress(0);

    const interval = 120;
    let elapsed = 0;
    const totalDuration = 5000;

    const timer = setInterval(() => {
      elapsed += interval;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setExportProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setIsExporting(false);
        handleTriggerConfetti();

        if (onQueueRender) {
          onQueueRender({
            id: `video-player-${Date.now()}`,
            name: `Reels / TikTok: ${selectedPlayer.cleanName}`,
            type: 'video_player',
            format: 'webm',
            status: 'completed',
            progress: 100,
            timestamp: new Date().toLocaleTimeString(),
            url: '#'
          });
        }
      }
    }, interval);
  };

  const socialCaption = `🔥 ¡FICHA DE JUGADOR: ${selectedPlayer.cleanName}! 🔥

🏀 Equipo: ${selectedPlayer.team}
📊 BD Score Oficial: ${selectedPlayer.bd_score}/100 ${selectedPlayer.trend > 0 ? `(+${selectedPlayer.trend} pts)` : ''}
⚡ Stats clave:
· ${selectedPlayer.points} PTS/partido (${selectedPlayer.pts_36} PTS/36)
· ${selectedPlayer.rebounds} REB · ${selectedPlayer.assists} AST
· ${selectedPlayer.valuation} VAL media

¿Merece estar en la selección o en una liga superior? Déjanos tu opinión en comentarios 👇

#BasketData #Baloncesto #FEB #LEBOro #ACB #Scouting #Basketball`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(socialCaption);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="player-video-studio">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/20 via-pink-500/10 to-purple-500/20 border border-orange-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider font-mono">
            Formato Vertical 9:16 (1080x1920)
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Poppins']">
            Creador de Vídeos de Jugador (TikTok / Reels / Shorts)
          </h2>
          <p className="text-xs sm:text-sm text-white/70 mt-1 font-['Inter']">
            Genera vídeos dinámicos con carta 3D, animación de estadísticas, audio sfx, música y revelación del BD Score.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerConfetti}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> Probar Confeti
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Remotion Player 9:16 */}
        <div className="lg:col-span-5 bg-[#111022] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-white/70 font-mono">
              Previsualización Vertical Remotion
            </span>
            <span className="text-xs text-orange-400 font-mono">
              {Math.round(calculatedDuration / 30)}s
            </span>
          </div>

          <div className="w-full max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/15 relative">
            <Player
              component={PlayerVideoIntro}
              inputProps={playerProps}
              durationInFrames={calculatedDuration}
              fps={30}
              compositionWidth={1080}
              compositionHeight={1920}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls
              autoPlay
              loop
            />
          </div>

          <div className="w-full mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={handleExportVideo}
              disabled={isExporting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? `Renderizando Vídeo: ${exportProgress}%` : 'Exportar Vídeo TikTok / Reels (9:16)'}
            </button>

            {isExporting && (
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full transition-all duration-150"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customization & Social Copy */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customization Card */}
          <div className="bg-[#111022] border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white font-['Poppins'] flex items-center gap-2 border-b border-white/10 pb-3">
              <Zap className="w-4 h-4 text-orange-400" /> Configuración Visual & Audio
            </h3>

            {/* Select Player */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 font-['Inter']">
                Jugador Seleccionado
              </label>
              <select
                value={selectedPlayer.id}
                onChange={(e) => {
                  const p = SAMPLE_PLAYERS.find((x) => x.id === e.target.value);
                  if (p) setSelectedPlayer(p);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
              >
                {SAMPLE_PLAYERS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#111022]">
                    {p.cleanName} — {p.team} (BD Score: {p.bd_score})
                  </option>
                ))}
              </select>
            </div>

            {/* Audio & Music Styles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/70 font-['Inter'] flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-orange-400" /> Estilo de Música de Fondo
                </label>
                <button
                  onClick={() => setSfxEnabled(!sfxEnabled)}
                  className="text-xs text-white/50 hover:text-white flex items-center gap-1 font-mono"
                >
                  {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
                  {sfxEnabled ? 'Sonido Activado' : 'Silenciado'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MUSIC_OPTIONS.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setMusicStyle(m.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      musicStyle === m.id
                        ? 'bg-orange-500/20 border-orange-500/50 text-white'
                        : 'bg-black/30 border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[11px] text-white/40">{m.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewMusic(m.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                      title="Preescuchar"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges Color & Reveal Effect */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Color de Insignias (Badges)
                </label>
                <div className="flex gap-2">
                  {BADGE_COLORS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBadgeColor(b.id)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        badgeColor === b.id
                          ? 'border-white bg-white/10 text-white'
                          : 'border-white/5 bg-black/20 text-white/50'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Efecto de Revelación
                </label>
                <select
                  value={revealEffect}
                  onChange={(e) => setRevealEffect(e.target.value as RevealEffect)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {REVEAL_EFFECTS.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#111022]">
                      {r.label} — {r.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Suspense Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
              <div>
                <span className="text-xs font-bold text-white block">Efecto Suspense BD Score</span>
                <span className="text-[11px] text-white/50 block">
                  Oculta el número hasta el final del clip para aumentar la retención del espectador.
                </span>
              </div>
              <button
                onClick={() => setHideScore(!hideScore)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  hideScore
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-white/5 text-white/40 border-white/10'
                }`}
              >
                {hideScore ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {hideScore ? 'Oculto al inicio' : 'Visible'}
              </button>
            </div>

            {/* Video Intro Source Option */}
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-orange-400" /> Modo de Intro (0s - 3s)
                  </span>
                  <span className="text-[11px] text-white/50 block">
                    {customVideoUrl
                      ? `Vídeo personalizado: ${customVideoName || 'Archivo cargado'}`
                      : 'Animación Motion Graphics oficial BasketData (Avatar + Dorsal)'}
                  </span>
                </div>
                {customVideoUrl && (
                  <button
                    onClick={() => {
                      setCustomVideoUrl(null);
                      setCustomVideoName('');
                    }}
                    className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs flex items-center gap-1"
                    title="Quitar vídeo y volver al modo gráfico"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Quitar
                  </button>
                )}
              </div>

              {!customVideoUrl ? (
                <label className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-white/15 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-colors text-xs">
                  <Upload className="w-3.5 h-3.5 text-orange-400" />
                  <span>Subir clip de vídeo de Jordi / orador (WebM o MP4)</span>
                  <input
                    type="file"
                    accept="video/webm,video/mp4"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setCustomVideoUrl(url);
                        setCustomVideoName(file.name);
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                  <Check className="w-3.5 h-3.5" /> Clip listo para reproducirse en la intro
                </div>
              )}
            </div>
          </div>

          {/* Social Media Copy Box */}
          <div className="bg-[#111022] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white font-['Poppins'] flex items-center gap-2">
                <Share2 className="w-4 h-4 text-orange-400" /> Copy para Redes Sociales
              </h3>
              <button
                onClick={handleCopyCaption}
                className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-orange-500/20"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                {copySuccess ? 'Copiado' : 'Copiar Texto'}
              </button>
            </div>

            <textarea
              readOnly
              value={socialCaption}
              rows={6}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-white/80 font-mono leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
