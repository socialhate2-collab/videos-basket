import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';

/* ============================================================
 *  Ranking · Estilo BasketData (optimizado para VERTICAL 9:16)
 *  Mismos colores/tipografía que los carruseles. Foto real del
 *  jugador vía proxy del backend (para grabar bien el WebM).
 * ============================================================ */

const GRAD = 'linear-gradient(90deg,#eb5934,#fb923c,#a855f7)';
const gradText = {
  background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text',
  WebkitTextFillColor: 'transparent', color: 'transparent',
};
const BG =
  'radial-gradient(ellipse 1000px 900px at 50% 0%, rgba(168,85,247,0.20), transparent), radial-gradient(ellipse 900px 800px at 50% 100%, rgba(236,72,153,0.14), transparent), #0c0a17';

const proxiedPhoto = (url) => {
  if (!url) return null;
  if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.includes('imagenes.feb.es')) return `/api/proxy?url=${encodeURIComponent(url)}`;
  return url;
};

const rankAccent = (rank) => {
  if (rank === 1) return '#fbbf24';
  if (rank === 2) return '#cbd5e1';
  if (rank === 3) return '#fb923c';
  return '#a855f7';
};
const rankLabel = (rank) => (rank === 1 ? 'Nº 1' : rank === 2 ? 'PLATA' : rank === 3 ? 'BRONCE' : `TOP ${rank}`);

export const RankingBasketData = ({ rankingData }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const { players = [], stat = 'Puntos', title = 'Top Jugadores' } = rankingData || {};
  const framesPerPlayer = 90;

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 20], [-30, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: "'Poppins','Inter',sans-serif" }}>
      {/* Grano sutil */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '5px 5px',
      }} />

      {/* Título superior */}
      <div style={{
        position: 'absolute', top: vertical ? '3.5%' : '4.5%', width: '100%', textAlign: 'center',
        opacity: titleOpacity, transform: `translateY(${titleY}px)`, zIndex: 5, padding: '0 40px',
      }}>
        <span style={{
          display: 'inline-block', padding: vertical ? '10px 26px' : '8px 22px', borderRadius: 999,
          background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.45)',
          color: '#eb5934', fontSize: vertical ? 26 : 22, fontWeight: 700, letterSpacing: 2,
        }}>
          Temporada 2025-2026
        </span>
        <h1 style={{ ...gradText, fontSize: vertical ? 84 : 76, fontWeight: 900, margin: vertical ? '16px 0 0' : '12px 0 0', lineHeight: 1.05, letterSpacing: 1 }}>
          {title}
        </h1>
      </div>

      {/* Jugadores (revelado del último al primero) */}
      {players.map((player, index) => {
        const playerStart = 30 + (players.length - 1 - index) * framesPerPlayer;
        return (
          <Sequence key={index} from={playerStart} durationInFrames={framesPerPlayer}>
            <PlayerCard player={player} rank={index + 1} fps={fps} vertical={vertical} stat={stat} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const PlayerCard = ({ player, rank, fps, vertical, stat = 'Puntos' }) => {
  const frame = useCurrentFrame();
  const accent = rankAccent(rank);
  const photo = vertical ? 460 : 310;

  const enter = spring({ frame, fps, config: { damping: 16 } });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const exit = interpolate(frame, [74, 90], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glow = interpolate(frame, [0, 30, 60, 90], [0.3, 1, 1, 0.3]);
  const statPop = spring({ frame: frame - 16, fps, config: { damping: 12 } });
  const statValue = player.stat_value ?? player.value ?? '0';
  const displayStatLabel = (player.stat_label || stat || 'Estadística').toUpperCase();

  return (
    <AbsoluteFill style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: opacity * exit, paddingTop: vertical ? '16%' : '8%', paddingBottom: vertical ? '7.5%' : '6%',
    }}>
      <div style={{
        width: vertical ? '90%' : '80%', maxWidth: vertical ? 960 : 1480, height: '100%',
        background: 'linear-gradient(180deg, rgba(168,85,247,0.12), rgba(236,72,153,0.05))',
        border: `2.5px solid ${accent}66`, borderRadius: 44,
        boxShadow: `0 0 80px ${accent}33, 0 35px 80px rgba(0,0,0,0.5)`,
        transform: `translateY(${(1 - enter) * 50}px) scale(${0.95 + enter * 0.05})`,
        overflow: 'hidden', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: vertical ? '36px 44px 30px' : '32px 48px',
        justifyContent: 'space-between',
      }}>
        {/* Nº de ranking gigante de fondo */}
        <div style={{
          position: 'absolute', top: -70, right: -10, fontSize: vertical ? 480 : 340, fontWeight: 900,
          ...gradText, opacity: 0.10, lineHeight: 1, pointerEvents: 'none',
        }}>#{rank}</div>

        {/* Badge posición */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12, background: `${accent}1f`,
          border: `1.5px solid ${accent}`, borderRadius: 999, padding: vertical ? '10px 26px' : '8px 22px', zIndex: 2,
          flexShrink: 0,
        }}>
          <span style={{ color: accent, fontSize: vertical ? 36 : 28, fontWeight: 900 }}>#{rank}</span>
          <span style={{ color: accent, fontSize: vertical ? 24 : 20, fontWeight: 700, letterSpacing: 2 }}>{rankLabel(rank)}</span>
        </div>

        {/* Foto */}
        <div style={{ position: 'relative', flexShrink: 0, zIndex: 2 }}>
          <div style={{
            position: 'absolute', inset: -30, borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}77 0%, transparent 70%)`,
            filter: 'blur(32px)', opacity: glow,
          }} />
          <div style={{
            width: photo, height: photo, borderRadius: '50%',
            border: '7px solid transparent', backgroundImage: `linear-gradient(#0c0a17,#0c0a17), ${GRAD}`,
            backgroundOrigin: 'border-box', backgroundClip: 'content-box, border-box',
            position: 'relative', overflow: 'hidden',
          }}>
            {(player.photo_url || player.photo) ? (
              <img
                src={proxiedPhoto(player.photo_url || player.photo)}
                alt={player.name}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#a855f7,#1a1030)', fontSize: photo * 0.34, fontWeight: 900, color: '#fff', borderRadius: '50%',
              }}>{player.name?.charAt(0) || '?'}</div>
            )}
          </div>
        </div>

        {/* Nombre + equipo */}
        <div style={{ textAlign: 'center', zIndex: 2, width: '100%', flexShrink: 0 }}>
          <h2 style={{
            fontSize: (player.name || '').length > 20 ? (vertical ? 50 : 44) : (vertical ? 66 : 58),
            fontWeight: 900, color: '#f5f5f7', margin: 0, lineHeight: 1.05, letterSpacing: 0.5,
          }}>{player.name || 'Jugador'}</h2>
          <p style={{
            fontSize: vertical ? 28 : 24, fontWeight: 700, color: accent, margin: '8px 0 0',
            fontFamily: "'Inter',sans-serif", textTransform: 'uppercase', letterSpacing: 1,
          }}>{player.team || player.team_name || 'Equipo'}</p>
        </div>

        {/* Estadística destacada */}
        <div style={{
          width: '100%', borderRadius: 24, padding: vertical ? '22px 24px 20px' : '18px 24px',
          background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${accent}45`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2,
          transform: `scale(${0.93 + statPop * 0.07})`, flexShrink: 0,
        }}>
          <span style={{ ...gradText, fontSize: vertical ? 144 : 110, fontWeight: 900, lineHeight: 1 }}>{statValue}</span>
          <span style={{
            fontFamily: "'Inter',sans-serif", fontSize: vertical ? 24 : 20, letterSpacing: 3,
            color: '#cbd5e1', textTransform: 'uppercase', marginTop: 6, textAlign: 'center', fontWeight: 600,
          }}>{displayStatLabel}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default RankingBasketData;
