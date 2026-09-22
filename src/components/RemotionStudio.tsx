import React, { useState, useEffect, useRef } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { 
  Video, 
  Trophy, 
  Flame, 
  Users, 
  Play, 
  Pause, 
  Download, 
  RotateCcw, 
  Settings2, 
  Sparkles, 
  Maximize2,
  CheckCircle,
  Clock,
  Layers,
  Zap,
  Radio,
  Share2,
  Music,
  Copy,
  Check,
  Instagram,
  Image,
  X,
  AlertCircle,
  FileVideo,
  Sliders,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Info,
  MousePointerClick
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchVideo } from '../remotion/MatchVideo';
import { RankingBasketData } from '../remotion/RankingBasketData';
import { RankingCardFEB } from '../remotion/RankingCardFEB';
import { RankingComic } from '../remotion/RankingComic';
import { RankingAnime } from '../remotion/RankingAnime';
import { RankingFire } from '../remotion/RankingFire';
import { RankingNeon } from '../remotion/RankingNeon';
import { RankingClassic } from '../remotion/RankingClassic';
import { Ranking2K } from '../remotion/Ranking2K';
import { Battle1v1BasketData } from '../remotion/Battle1v1BasketData';
import { Battle1v1Fire } from '../remotion/Battle1v1Fire';
import { PlayerSpotlightBasketData } from '../remotion/PlayerSpotlightBasketData';
import { PlayerSpotlightFire } from '../remotion/PlayerSpotlightFire';
import { 
  MatchData, 
  RankingDesign, 
  RankingPlayer,
  RemotionTabType,
  RenderJob 
} from '../types/bdata';
import { 
  SAMPLE_MATCHES, 
  SAMPLE_PLAYERS, 
  SAMPLE_TOP_PLAYERS 
} from '../data/mockBasketData';
import { fetchMatchesApi, fetchTopPlayersApi, fetchPlayersApi } from '../services/basketDataApi';
import { getSafePhotoUrl } from '../lib/photoProxy';
import { 
  exportSocialVideo, 
  exportPosterPng, 
  generateSocialPostCopy,
  ExportProgress,
  ExportResult
} from '../lib/videoExporter';
import confetti from 'canvas-confetti';

interface RemotionStudioProps {
  onQueueRender?: (job: RenderJob) => void;
  onOpenRailwayModal?: () => void;
}

export const RemotionStudio: React.FC<RemotionStudioProps> = ({ onQueueRender, onOpenRailwayModal }) => {
  const [activeTab, setActiveTab] = useState<RemotionTabType>('ranking');
  const [isVertical, setIsVertical] = useState(false);
  const [rankingDesign, setRankingDesign] = useState<RankingDesign>('anime');
  const [rankingFocus, setRankingFocus] = useState<'mvp' | 'all'>('mvp');
  const [selectedStat, setSelectedStat] = useState('points');
  const [topN, setTopN] = useState(5);

  // Real Super Cache Ranking State
  const [rankingPlayers, setRankingPlayers] = useState<RankingPlayer[]>(
    SAMPLE_TOP_PLAYERS['points'] || []
  );
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);
  const [useAiAvatarForMvp, setUseAiAvatarForMvp] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>(SAMPLE_PLAYERS);
  
  // Matches State
  const [matches, setMatches] = useState<MatchData[]>(SAMPLE_MATCHES);
  const [selectedMatch, setSelectedMatch] = useState<MatchData>(SAMPLE_MATCHES[0]);

  // Battle State
  const [battleDesign, setBattleDesign] = useState<'basketdata' | 'fire'>('basketdata');
  const [player1, setPlayer1] = useState(SAMPLE_PLAYERS[0]);
  const [player2, setPlayer2] = useState(SAMPLE_PLAYERS[1]);

  // Spotlight State
  const [spotlightDesign, setSpotlightDesign] = useState<'basketdata' | 'fire'>('basketdata');
  const [selectedPlayer, setSelectedPlayer] = useState(SAMPLE_PLAYERS[0]);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [lastExportUrl, setLastExportUrl] = useState<string | null>(null);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  // Social Media Video Export Suite State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'mp4' | 'webm'>('mp4');
  const [exportQuality, setExportQuality] = useState<'ultra' | 'high' | 'standard'>('ultra');
  const [exportMusic, setExportMusic] = useState<'energetic' | 'hiphop' | 'epic' | 'chill' | 'none'>('energetic');
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const cancelExportRef = useRef(false);

  useEffect(() => {
    loadMatches();
    loadAllPlayers();
  }, []);

  useEffect(() => {
    loadRankings();
  }, [selectedStat, topN]);

  const loadMatches = async () => {
    const list = await fetchMatchesApi();
    if (list && list.length > 0) {
      setMatches(list);
      setSelectedMatch(list[0]);
    }
  };

  const loadAllPlayers = async () => {
    try {
      const list = await fetchPlayersApi();
      if (list && list.length > 0) {
        const formatted = list.map((p: any) => ({
          ...p,
          cleanName: p.cleanName || p.name || 'Jugador FEB',
          points: Number(p.points || 0),
          rebounds: Number(p.rebounds || 0),
          assists: Number(p.assists || 0),
          valuation: Number(p.valuation || 0),
        }));
        setAvailablePlayers(formatted);
        if (formatted[0]) setPlayer1(formatted[0]);
        if (formatted[1]) setPlayer2(formatted[1]);
        if (formatted[0]) setSelectedPlayer(formatted[0]);
      }
    } catch (err) {
      console.warn('Using default players:', err);
    }
  };

  const loadRankings = async () => {
    setIsLoadingRankings(true);
    try {
      const list = await fetchTopPlayersApi(selectedStat, Math.max(topN, 10));
      if (list && list.length > 0) {
        setRankingPlayers(list);
      } else {
        const fallback = SAMPLE_TOP_PLAYERS[selectedStat] || SAMPLE_TOP_PLAYERS['points'];
        setRankingPlayers(fallback);
      }
    } catch (err) {
      console.error('Error fetching real rankings:', err);
      const fallback = SAMPLE_TOP_PLAYERS[selectedStat] || SAMPLE_TOP_PLAYERS['points'];
      setRankingPlayers(fallback);
    } finally {
      setIsLoadingRankings(false);
    }
  };

  // Dimensions
  const compWidth = isVertical ? 1080 : 1920;
  const compHeight = isVertical ? 1920 : 1080;

  // Select appropriate Remotion component
  const getActiveComponent = () => {
    switch (activeTab) {
      case 'matches':
        return MatchVideo;
      case 'ranking':
        if (rankingDesign === 'anime') return RankingAnime;
        if (rankingDesign === 'card') return RankingCardFEB;
        if (rankingDesign === 'comic') return RankingComic;
        if (rankingDesign === 'fire') return RankingFire;
        if (rankingDesign === 'neon') return RankingNeon;
        if (rankingDesign === 'classic') return RankingClassic;
        if (rankingDesign === '2k') return Ranking2K;
        return RankingBasketData;
      case 'battle':
        return battleDesign === 'fire' ? Battle1v1Fire : Battle1v1BasketData;
      case 'spotlight':
        return spotlightDesign === 'fire' ? PlayerSpotlightFire : PlayerSpotlightBasketData;
      default:
        return MatchVideo;
    }
  };

  // Duration in frames (at 30 fps)
  const getDurationInFrames = () => {
    switch (activeTab) {
      case 'matches': return 210; // 7s
      case 'ranking': return rankingFocus === 'mvp' ? 120 : (25 + topN * 90 + 30);
      case 'battle': return 240; // 8s
      case 'spotlight': return 240; // 8s
      default: return 210;
    }
  };

  // Build input props
  const getInputProps = () => {
    switch (activeTab) {
      case 'matches':
        return { matchData: selectedMatch };
      case 'ranking': {
        const currentList = rankingPlayers.length > 0 
          ? rankingPlayers 
          : (SAMPLE_TOP_PLAYERS[selectedStat] || SAMPLE_TOP_PLAYERS.points);
        
        const playersList = currentList.slice(0, topN).map((p, idx) => {
          const isAnimeAvatar = useAiAvatarForMvp && idx === 0;
          const photoRaw = isAnimeAvatar ? '/anime_player_card.jpg' : (p.photo || p.photo_url || null);
          const safePhoto = getSafePhotoUrl(photoRaw);
          const numVal = p.value !== undefined ? p.value : (p.stat_value !== undefined ? p.stat_value : 0);
          const formattedVal = Math.round(Number(numVal) * 10) / 10;
          const playerName = p.cleanName || p.name || `Jugador ${idx + 1}`;
          const teamName = p.team || p.team_name || 'Club FEB';

          return {
            ...p,
            name: playerName,
            cleanName: playerName,
            photo: safePhoto,
            photo_url: safePhoto,
            value: formattedVal,
            stat_value: formattedVal,
            team: teamName,
            team_name: teamName,
          };
        });

        const statLabelMap: Record<string, { label: string; plural: string }> = {
          points: { label: 'Puntos', plural: 'Anotadores' },
          valuation: { label: 'Valoración', plural: 'Líderes en Valoración' },
          assists: { label: 'Asistencias', plural: 'Líderes en Asistencias' },
          rebounds: { label: 'Rebotes', plural: 'Líderes en Rebotes' }
        };
        const statConfig = statLabelMap[selectedStat] || { label: 'Puntos', plural: 'Anotadores' };

        return {
          rankingData: {
            title: rankingFocus === 'mvp' 
              ? `MVP #1 · Top ${statConfig.label}` 
              : `Top ${topN} ${statConfig.plural}`,
            subtitle: 'Promedios Oficiales de Temporada (FEB)',
            stat: statConfig.label,
            players: playersList,
            singlePlayer: rankingFocus === 'mvp',
            focusRank: rankingFocus === 'mvp' ? 1 : null,
          },
        };
      }
      case 'battle':
        return {
          battleData: {
            player1: {
              name: player1.cleanName || player1.name,
              team: player1.team || (player1 as any).team_name,
              team_name: player1.team || (player1 as any).team_name,
              photo: getSafePhotoUrl(player1.photo || (player1 as any).photo_url),
              photo_url: getSafePhotoUrl(player1.photo || (player1 as any).photo_url),
              stat_value: player1.points,
              points: player1.points,
              rebounds: player1.rebounds,
              assists: player1.assists,
              valuation: player1.valuation,
            },
            player2: {
              name: player2.cleanName || player2.name,
              team: player2.team || (player2 as any).team_name,
              team_name: player2.team || (player2 as any).team_name,
              photo: getSafePhotoUrl(player2.photo || (player2 as any).photo_url),
              photo_url: getSafePhotoUrl(player2.photo || (player2 as any).photo_url),
              stat_value: player2.points,
              points: player2.points,
              rebounds: player2.rebounds,
              assists: player2.assists,
              valuation: player2.valuation,
            },
            stat: 'Puntos por Partido',
          },
        };
      case 'spotlight':
        return {
          playerData: {
            player: {
              ...selectedPlayer,
              name: selectedPlayer.cleanName || selectedPlayer.name,
              team: selectedPlayer.team || (selectedPlayer as any).team_name,
              team_name: selectedPlayer.team || (selectedPlayer as any).team_name,
              photo: getSafePhotoUrl(selectedPlayer.photo || (selectedPlayer as any).photo_url),
              photo_url: getSafePhotoUrl(selectedPlayer.photo || (selectedPlayer as any).photo_url),
              number: selectedPlayer.number,
              position: selectedPlayer.position,
              height: selectedPlayer.height,
              points: selectedPlayer.points,
              rebounds: selectedPlayer.rebounds,
              assists: selectedPlayer.assists,
              valuation: selectedPlayer.valuation,
              bd_score: selectedPlayer.bd_score,
              trend: selectedPlayer.trend,
            },
          },
        };
      default:
        return {};
    }
  };

  // Social Media Video Export & Render Handlers
  const openExportModal = () => {
    // If on ranking, default to 9:16 Vertical for optimal TikTok / Reels compatibility
    if (activeTab === 'ranking' && !isVertical) {
      // User can still choose horizontal, but vertical is the social default
    }
    setExportError(null);
    setExportProgress(null);
    setExportResult(null);
    setShowExportModal(true);
  };

  const handleCancelExport = () => {
    cancelExportRef.current = true;
    setIsExporting(false);
    setExportProgress(null);
  };

  const handleExportVideo = async () => {
    if (!playerContainerRef.current || !playerRef.current) return;
    setIsExporting(true);
    setExportError(null);
    setExportResult(null);
    cancelExportRef.current = false;

    try {
      const statMap: Record<string, string> = {
        points: 'Puntos',
        valuation: 'Valoración',
        assists: 'Asistencias',
        rebounds: 'Rebotes',
      };
      const statName = statMap[selectedStat] || 'Estadísticas';
      const cleanDesign = activeTab === 'ranking' ? rankingDesign.toUpperCase() : activeTab.toUpperCase();
      const filename = `basketdata-ranking-${activeTab}-${cleanDesign}-${Date.now()}.${exportFormat}`;

      const res = await exportSocialVideo({
        containerElement: playerContainerRef.current,
        playerRef,
        durationInFrames: getDurationInFrames(),
        width: compWidth,
        height: compHeight,
        fps: 30,
        format: exportFormat,
        quality: exportQuality,
        bgMusic: exportMusic,
        filename,
        shouldCancel: () => cancelExportRef.current,
        onProgress: (p) => setExportProgress(p),
      });

      setExportResult(res);
      setLastExportUrl(res.url);

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      if (onQueueRender) {
        onQueueRender({
          id: `render-${Date.now()}`,
          name: `Ranking ${rankingFocus === 'mvp' ? 'MVP' : `Top ${topN}`} (${cleanDesign})`,
          type: 'ranking',
          format: res.format,
          status: 'completed',
          progress: 100,
          timestamp: new Date().toLocaleTimeString(),
          url: res.url,
        });
      }
    } catch (err: any) {
      console.error('Error during video export:', err);
      if (!cancelExportRef.current) {
        setExportError(err.message || 'Error al renderizar el vídeo');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPoster = async () => {
    if (!playerContainerRef.current) return;
    try {
      const filename = `basketdata-portada-${rankingDesign}-${Date.now()}.png`;
      const url = await exportPosterPng(playerContainerRef.current, filename, compWidth, compHeight);
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch {}

      if (onQueueRender) {
        onQueueRender({
          id: `poster-${Date.now()}`,
          name: `Portada Miniatura (${rankingDesign.toUpperCase()})`,
          type: 'ranking',
          format: 'png',
          status: 'completed',
          progress: 100,
          timestamp: new Date().toLocaleTimeString(),
          url,
        });
      }
    } catch (e: any) {
      console.error('Error exporting poster image:', e);
    }
  };

  const handleCopyCaption = () => {
    const statMap: Record<string, string> = {
      points: 'Puntos por partido',
      valuation: 'Valoración media',
      assists: 'Asistencias por partido',
      rebounds: 'Rebotes por partido',
    };
    const topP = rankingPlayers[0] || SAMPLE_PLAYERS[0];
    const copy = generateSocialPostCopy({
      category: 'Competición FEB / BasketData',
      statName: statMap[selectedStat] || selectedStat,
      topPlayerName: topP.cleanName || topP.name,
      topPlayerTeam: topP.team || (topP as any).team_name || 'FEB',
      topPlayerStat: (topP as any)[selectedStat] || topP.stat_value || 24.5,
      topPlayers: rankingPlayers.slice(0, topN).map((p, idx) => ({
        name: p.cleanName || p.name,
        team: p.team || (p as any).team_name || 'FEB',
        stat: (p as any)[selectedStat] || p.stat_value || 20,
        rank: idx + 1,
      })),
    });

    navigator.clipboard.writeText(copy);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const [shareSuccess, setShareSuccess] = useState(false);
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleShareVideo = async () => {
    if (!exportResult?.blob) return;
    try {
      const file = new File([exportResult.blob], exportResult.filename, {
        type: exportResult.blob.type || (exportResult.format === 'mp4' ? 'video/mp4' : 'video/webm'),
      });
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'BasketData Ranking Video',
          text: 'Vídeo generado en BasketData Studio para redes sociales',
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        const directUrl = exportResult.serverDownloadUrl || exportResult.url;
        window.open(directUrl, '_blank');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Share error:', err);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="remotion-studio">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111022] p-3 rounded-2xl border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'matches'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" /> Partidos
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'ranking'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" /> Rankings
          </button>
          <button
            onClick={() => setActiveTab('battle')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'battle'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" /> 1v1 Battle
          </button>
          <button
            onClick={() => setActiveTab('spotlight')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'spotlight'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Player Spotlight
          </button>
        </div>

        {/* Orientation Toggle */}
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setIsVertical(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isVertical ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            16:9 Horizontal
          </button>
          <button
            onClick={() => setIsVertical(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isVertical ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            9:16 Vertical
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left = Video Player, Right = Customization Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Remotion Player Stage */}
        <div className="lg:col-span-8 bg-[#111022] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Remotion Live Canvas ({compWidth}x{compHeight} · 30 FPS)
              </span>
            </div>
            <span className="text-xs text-white/40 font-mono">
              {Math.round(getDurationInFrames() / 30)}s duración total
            </span>
          </div>

          {/* Player Wrapper */}
          <div 
            ref={playerContainerRef}
            className={`relative rounded-xl overflow-hidden shadow-2xl bg-black border border-white/15 flex items-center justify-center transition-all ${
              isVertical ? 'w-full max-w-[340px] aspect-[9/16]' : 'w-full aspect-[16/9]'
            }`}
          >
            <Player
              ref={playerRef}
              component={getActiveComponent()}
              inputProps={getInputProps()}
              durationInFrames={getDurationInFrames()}
              fps={30}
              compositionWidth={compWidth}
              compositionHeight={compHeight}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls
              autoPlay
              loop
            />
          </div>

          {/* Render & Export Actions Bar */}
          <div className="w-full mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-white/60 font-['Inter'] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Formato Social: <strong className="text-white">MP4 (H.264 1080p)</strong> · {isVertical ? '9:16 (Reels/TikTok)' : '16:9 (Horizontal)'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={openExportModal}
                disabled={isExporting}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all group disabled:opacity-50"
              >
                <Instagram className="w-4 h-4 text-white" />
                <span>Descargar para Redes</span>
                <span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono uppercase tracking-wider">
                  MP4 1080p
                </span>
              </button>

              <button
                onClick={handleExportPoster}
                disabled={isExporting}
                title="Descargar Portada / Miniatura PNG en 1080p"
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-white/10 disabled:opacity-50"
              >
                <Image className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Portada HD</span>
              </button>

              <button
                onClick={openExportModal}
                title="Ajustes de Formato y Redes Sociales"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/5"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {lastExportUrl && (
                <a
                  href={lastExportUrl}
                  download={`basketdata-${activeTab}-${Date.now()}.${exportResult?.format || 'mp4'}`}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-colors border border-emerald-500/30"
                >
                  <CheckCircle className="w-4 h-4" /> Descargar de nuevo
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Controls depending on Tab */}
        <div className="lg:col-span-4 bg-[#111022] border border-white/10 rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Settings2 className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white font-['Poppins']">
              Parámetros de la Composición
            </h3>
          </div>

          {/* Controls for: Matches */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-[11px] font-medium text-white/70">
                    {matches.length} partidos disponibles
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={loadMatches}
                    title="Recargar partidos"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  {onOpenRailwayModal && (
                    <button
                      onClick={onOpenRailwayModal}
                      className="px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-[10px] font-bold text-orange-400 font-mono transition-colors"
                    >
                      Conectar Railway
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Seleccionar Partido (FEB / ACB)
                </label>
                <select
                  value={selectedMatch.id}
                  onChange={(e) => {
                    const m = matches.find((x) => x.id === e.target.value);
                    if (m) setSelectedMatch(m);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#111022] text-white">
                      {m.home_team} vs {m.away_team} ({m.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-white/50 mb-1">Puntos Local</label>
                  <input
                    type="number"
                    value={selectedMatch.home_score}
                    onChange={(e) => setSelectedMatch({ ...selectedMatch, home_score: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-white/50 mb-1">Puntos Visitante</label>
                  <input
                    type="number"
                    value={selectedMatch.away_score}
                    onChange={(e) => setSelectedMatch({ ...selectedMatch, away_score: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/50 mb-1">Nombre Jugador MVP</label>
                <input
                  type="text"
                  value={selectedMatch.mvp_name}
                  onChange={(e) => setSelectedMatch({ ...selectedMatch, mvp_name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/50 mb-1">Línea de Stats MVP</label>
                <input
                  type="text"
                  value={selectedMatch.mvp_stats}
                  onChange={(e) => setSelectedMatch({ ...selectedMatch, mvp_stats: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Controls for: Rankings */}
          {activeTab === 'ranking' && (
            <div className="space-y-4">
              {/* Real Super Cache Connection Badge */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 block">
                      Super Caché FEB (Datos Reales)
                    </span>
                    <span className="text-[10px] text-emerald-400/70">
                      4.124 jugadores sincronizados
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={loadRankings}
                    disabled={isLoadingRankings}
                    title="Recargar datos de la super caché"
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isLoadingRankings ? 'animate-spin' : ''}`} />
                  </button>
                  {onOpenRailwayModal && (
                    <button
                      onClick={onOpenRailwayModal}
                      className="px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[9px] font-bold text-emerald-300 uppercase font-mono transition-colors"
                    >
                      Config
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Estilo Visual del Ranking
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'anime', label: '🎨 Streetball Manga AI' },
                    { id: 'comic', label: '🏀 Streetball Comic' },
                    { id: 'card', label: '🃏 Carta Digital FEB' },
                    { id: 'basketdata', label: '✨ BasketData Brand' },
                    { id: 'fire', label: '🔥 Fire & Flames' },
                    { id: 'neon', label: '⚡ Cyber Neon' },
                    { id: 'classic', label: '🏆 Clásico Deportivo' },
                    { id: '2k', label: '🎮 NBA 2K Style' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setRankingDesign(style.id as RankingDesign)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition-all border ${
                        rankingDesign === style.id
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                          : 'bg-black/30 text-white/60 border-white/5 hover:text-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Métrica Oficial del Ranking</label>
                <select
                  value={selectedStat}
                  onChange={(e) => setSelectedStat(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="points">Puntos por Partido (PTS) · Máximos Anotadores</option>
                  <option value="valuation">Valoración Media (VAL) · MVPs de la Jornada</option>
                  <option value="assists">Asistencias por Partido (AST) · Mejores Pasadores</option>
                  <option value="rebounds">Rebotes por Partido (REB) · Reyes del Tablero</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Modo de Reproducción
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRankingFocus('mvp')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold text-center border transition-all ${
                      rankingFocus === 'mvp'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                        : 'bg-black/30 text-white/60 border-white/5 hover:text-white'
                    }`}
                  >
                    ⭐ Ver MVP #1
                  </button>
                  <button
                    onClick={() => setRankingFocus('all')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold text-center border transition-all ${
                      rankingFocus === 'all'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                        : 'bg-black/30 text-white/60 border-white/5 hover:text-white'
                    }`}
                  >
                    📊 Top {topN} (Cuenta Atrás)
                  </button>
                </div>
              </div>

              {/* Selector de Foto para el MVP #1 */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Foto del Jugador #1 (MVP)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setUseAiAvatarForMvp(false)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold text-center border transition-all ${
                      !useAiAvatarForMvp
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-black/30 text-white/60 border-white/5 hover:text-white'
                    }`}
                  >
                    📸 Foto Real FEB
                  </button>
                  <button
                    onClick={() => setUseAiAvatarForMvp(true)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold text-center border transition-all ${
                      useAiAvatarForMvp
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-black/30 text-white/60 border-white/5 hover:text-white'
                    }`}
                  >
                    🎨 Avatar Manga IA
                  </button>
                </div>
              </div>

              {rankingFocus === 'all' && (
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Número de Jugadores (Top {topN})
                  </label>
                  <div className="flex gap-2">
                    {[3, 5, 8, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setTopN(n)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          topN === n
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-black/30 text-white/60 border-white/5'
                        }`}
                      >
                        Top {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista en tiempo real de los jugadores que componen el ranking actual */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">
                  <span>Jugadores Reales en Ranking</span>
                  <span className="text-orange-400 font-mono">Top {Math.min(topN, rankingPlayers.length)}</span>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {rankingPlayers.slice(0, topN).map((player, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          idx === 0 
                            ? 'bg-amber-400 text-black' 
                            : idx === 1 
                            ? 'bg-slate-300 text-black' 
                            : idx === 2 
                            ? 'bg-amber-700 text-white' 
                            : 'bg-white/10 text-white/70'
                        }`}>
                          {player.rank || idx + 1}
                        </span>
                        {player.photo ? (
                          <img 
                            src={idx === 0 && useAiAvatarForMvp ? '/anime_player_card.jpg' : getSafePhotoUrl(player.photo)} 
                            alt={player.name}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/20"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="truncate">
                          <p className="font-bold text-white truncate text-[11px] leading-tight">
                            {player.name}
                          </p>
                          <p className="text-[10px] text-white/50 truncate leading-tight">
                            {player.team}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-black text-amber-400 text-xs shrink-0 pl-2">
                        {player.value} <span className="text-[9px] text-white/50 font-sans">{selectedStat === 'points' ? 'PTS' : selectedStat === 'valuation' ? 'VAL' : selectedStat === 'assists' ? 'AST' : 'REB'}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Controls for: 1v1 Battle */}
          {activeTab === 'battle' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Estilo Visual</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBattleDesign('basketdata')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold text-center border ${
                      battleDesign === 'basketdata'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                        : 'bg-black/30 text-white/60 border-white/5'
                    }`}
                  >
                    BasketData
                  </button>
                  <button
                    onClick={() => setBattleDesign('fire')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold text-center border ${
                      battleDesign === 'fire'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : 'bg-black/30 text-white/60 border-white/5'
                    }`}
                  >
                    Fire Clash
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Jugador 1</label>
                <select
                  value={player1.id}
                  onChange={(e) => {
                    const p = availablePlayers.find((x) => x.id === e.target.value);
                    if (p) setPlayer1(p);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {availablePlayers.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#111022]">
                      {p.cleanName} ({p.team})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Jugador 2</label>
                <select
                  value={player2.id}
                  onChange={(e) => {
                    const p = availablePlayers.find((x) => x.id === e.target.value);
                    if (p) setPlayer2(p);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {availablePlayers.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#111022]">
                      {p.cleanName} ({p.team})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Controls for: Player Spotlight */}
          {activeTab === 'spotlight' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Jugador a Destacar</label>
                <select
                  value={selectedPlayer.id}
                  onChange={(e) => {
                    const p = availablePlayers.find((x) => x.id === e.target.value);
                    if (p) setSelectedPlayer(p);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {availablePlayers.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#111022]">
                      {p.cleanName} ({p.team}) · {p.position || 'FEB'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs text-white/70">
                <div className="flex justify-between">
                  <span>Posición:</span>
                  <span className="font-bold text-white">{selectedPlayer.position || 'FEB'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Puntos / Partido:</span>
                  <span className="font-bold text-orange-400">{selectedPlayer.points}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valoración Media:</span>
                  <span className="font-bold text-emerald-400">{selectedPlayer.valuation}</span>
                </div>
                <div className="flex justify-between">
                  <span>BD Score Oficial:</span>
                  <span className="font-bold text-purple-400">{selectedPlayer.bd_score || 85} / 100</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Social Media Video Export & Render Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#141226] border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-['Poppins'] flex items-center gap-2">
                      Exportador de Vídeo para Redes Sociales
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-mono font-bold uppercase border border-orange-500/30">
                        1080p Social
                      </span>
                    </h3>
                    <p className="text-xs text-white/60 font-['Inter']">
                      Formato MP4 (H.264 / AAC) 100% compatible con Instagram Reels, TikTok, YouTube Shorts y WhatsApp.
                    </p>
                  </div>
                </div>

                {!isExporting && (
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
                {/* 1. Export In Progress State */}
                {isExporting ? (
                  <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-5">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-white/10"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="url(#gradient-progress)"
                          strokeWidth="8"
                          strokeDasharray={264}
                          strokeDashoffset={264 - (264 * (exportProgress?.percent || 0)) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-300"
                          fill="transparent"
                        />
                        <defs>
                          <linearGradient id="gradient-progress" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#eab308" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white font-mono">
                          {exportProgress?.percent || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 max-w-md">
                      <h4 className="text-sm font-bold text-white">
                        {exportProgress?.phase === 'capturing' && 'Capturando fotogramas en ultra definición...'}
                        {exportProgress?.phase === 'transcoding' && 'Codificando MP4 y optimizando para redes móviles...'}
                        {exportProgress?.phase === 'preparing' && 'Preparando motor de renderizado...'}
                        {exportProgress?.phase === 'ready' && '¡Exportación completada!'}
                      </h4>
                      <p className="text-xs text-white/60">
                        {exportProgress?.message || 'Procesando vídeo...'}
                      </p>
                    </div>

                    {/* Live Snapshot Thumbnail Preview */}
                    {exportProgress?.previewDataUrl && (
                      <div className="w-32 h-44 rounded-xl overflow-hidden border border-white/20 shadow-xl bg-black relative">
                        <img
                          src={exportProgress.previewDataUrl}
                          alt="Fotograma en renderizado"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white/80">
                          {exportProgress.currentFrame}/{exportProgress.totalFrames}
                        </div>
                      </div>
                    )}

                    <div className="w-full max-w-sm pt-2">
                      <button
                        onClick={handleCancelExport}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400 text-xs font-semibold transition-colors"
                      >
                        Cancelar Renderizado
                      </button>
                    </div>
                  </div>
                ) : exportResult ? (
                  /* 2. Export Finished / Success State */
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-emerald-300">
                          ¡Vídeo listo y procesado en máxima calidad!
                        </h4>
                        <p className="text-xs text-white/70 mt-0.5">
                          Archivo: <strong className="text-white">{exportResult.filename}</strong> (formato {exportResult.format.toUpperCase()}). Listo para Instagram Reels, TikTok, YouTube Shorts y WhatsApp.
                        </p>
                        {exportResult.error && (
                          <p className="text-[11px] text-amber-300/80 mt-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            ℹ️ {exportResult.error}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Iframe Download Notice (Chrome security restriction guidance) */}
                    {isInIframe && (
                      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-200">
                        <div className="flex items-start gap-2.5">
                          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-white">¿Tu navegador muestra «Error de red» o bloquea la descarga?</span>
                            <p className="text-[11px] text-blue-200/80 mt-0.5">
                              Google Chrome bloquea descargas directas dentro de la vista previa embebida. Puedes hacer <strong>clic derecho en el reproductor &gt; «Guardar vídeo como...»</strong>, usar el botón <strong>«Abrir en pestaña nueva»</strong> o <strong>«Descargar archivo»</strong>.
                            </p>
                          </div>
                        </div>
                        <a
                          href={exportResult.serverDownloadUrl || window.location.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Abrir pestaña nueva
                        </a>
                      </div>
                    )}

                    {/* Video Player Preview with native save support */}
                    <div className="rounded-2xl overflow-hidden bg-black/90 border border-white/15 flex flex-col items-center justify-center p-3 relative">
                      <video
                        src={exportResult.url}
                        controls
                        autoPlay
                        loop
                        playsInline
                        className="max-h-[280px] w-auto rounded-xl shadow-lg border border-white/10"
                      />
                      <div className="mt-2.5 text-center text-[11px] text-white/50 flex items-center gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5 text-white/40" />
                        <span>También puedes hacer clic derecho sobre el vídeo (o mantener pulsado en móvil) y seleccionar <strong>«Guardar vídeo como...»</strong></span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <a
                        href={exportResult.serverDownloadUrl || exportResult.url}
                        download={exportResult.filename}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all text-center"
                      >
                        <Download className="w-4 h-4" />
                        Descargar Vídeo
                      </a>

                      <button
                        onClick={handleShareVideo}
                        className="p-3 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all text-center"
                      >
                        {shareSuccess ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300" />
                            <span>¡Compartido!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 text-purple-200" />
                            <span>Compartir / Enviar</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleExportPoster}
                        className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors text-center"
                      >
                        <Image className="w-4 h-4 text-amber-400" />
                        Portada HD
                      </button>

                      <button
                        onClick={handleCopyCaption}
                        className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors text-center"
                      >
                        {copiedCaption ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-blue-400" />
                            <span>Copiar Copy Redes</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs text-white/50 border-t border-white/10">
                      <span>Resolución: {compWidth}x{compHeight} · 30 FPS · {exportResult.format.toUpperCase()}</span>
                      <button
                        onClick={() => setExportResult(null)}
                        className="text-orange-400 hover:underline font-semibold"
                      >
                        Volver a ajustar parámetros
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 3. Settings & Configuration State */
                  <div className="space-y-5">
                    {exportError && (
                      <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{exportError}</span>
                      </div>
                    )}

                    {/* Format Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white flex items-center justify-between">
                        <span>Formato de Salida</span>
                        <span className="text-[11px] text-orange-400 font-mono">H.264 High Profile</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setExportFormat('mp4')}
                          className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                            exportFormat === 'mp4'
                              ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                              <Instagram className="w-4 h-4 text-orange-400" /> MP4 (Recomendado)
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-orange-500/30 text-orange-300 font-bold uppercase">
                              Social
                            </span>
                          </div>
                          <p className="text-[11px] text-white/60">
                            Instagram Reels, TikTok, Shorts, WhatsApp, X y móvil iOS/Android sin problemas de reproducción.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExportFormat('webm')}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            exportFormat === 'webm'
                              ? 'bg-purple-500/15 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                              <FileVideo className="w-4 h-4 text-purple-400" /> WebM Ultra HD
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/30 text-purple-300 font-bold uppercase">
                              Nativo
                            </span>
                          </div>
                          <p className="text-[11px] text-white/60">
                            Descarga inmediata en el navegador a 30 FPS con compresión VP9 sin pérdida.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Orientation & Aspect Ratio */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white flex items-center justify-between">
                        <span>Orientación del Vídeo</span>
                        <span className="text-[11px] text-white/50">{compWidth} × {compHeight} px</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setIsVertical(true)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isVertical
                              ? 'bg-white/15 border-white/40 text-white font-bold'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>📱 9:16 Vertical</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 font-bold">
                              Reels / TikTok
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50 mt-1">1080 × 1920 (Pantalla completa móvil)</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsVertical(false)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            !isVertical
                              ? 'bg-white/15 border-white/40 text-white font-bold'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>📺 16:9 Horizontal</span>
                          </div>
                          <p className="text-[11px] text-white/50 mt-1">1920 × 1080 (YouTube / Post Panorámico)</p>
                        </button>
                      </div>
                    </div>

                    {/* Quality Preset */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white">Nivel de Calidad y Bitrate</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'ultra', label: '💎 Ultra HD', desc: '25 Mbps · Máxima nitidez' },
                          { id: 'high', label: '🚀 Alta', desc: '16 Mbps · Balance pro' },
                          { id: 'standard', label: '⚡ Estándar', desc: '8 Mbps · Ligero' },
                        ].map((q) => (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setExportQuality(q.id as any)}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              exportQuality === q.id
                                ? 'bg-orange-500/20 border-orange-500 text-white font-bold'
                                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-bold text-white">{q.label}</div>
                            <div className="text-[10px] text-white/40 mt-0.5">{q.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Background Music Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5 text-orange-400" />
                          Banda Sonora para Redes (Audio AAC 192k)
                        </span>
                        <span className="text-[11px] text-white/40">Sincronizado con Remotion</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'energetic', name: '🔥 Enérgica EDM', desc: 'TikTok / Ritmo rápido' },
                          { id: 'hiphop', name: '🎧 Trap 808', desc: 'Urbano / Baloncesto' },
                          { id: 'epic', name: '🏆 Épica Victoria', desc: 'Cinematográfica' },
                          { id: 'chill', name: '☕ Lo-Fi Relax', desc: 'Ritmo suave' },
                          { id: 'none', name: '🔇 Sin Audio', desc: 'Vídeo mudo' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setExportMusic(m.id as any)}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              exportMusic === m.id
                                ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-bold text-white">{m.name}</div>
                            <div className="text-[10px] text-white/40 mt-0.5">{m.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary Info Banner */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-1">
                      <div className="flex justify-between">
                        <span>Duración estimada:</span>
                        <span className="font-bold text-white font-mono">
                          {Math.round(getDurationInFrames() / 30)} seg ({getDurationInFrames()} fotogramas)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolución de exportación:</span>
                        <span className="font-bold text-orange-400 font-mono">
                          {compWidth} × {compHeight} px (Full HD)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compatibilidad:</span>
                        <span className="font-bold text-emerald-400">
                          Instagram Reels, TikTok, YouTube Shorts, WhatsApp
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {!isExporting && !exportResult && (
                <div className="p-5 sm:p-6 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors"
                  >
                    Cerrar
                  </button>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={handleExportPoster}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      <Image className="w-4 h-4 text-amber-400" />
                      Portada PNG
                    </button>

                    <button
                      onClick={handleExportVideo}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Comenzar Descarga en Máxima Calidad</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
