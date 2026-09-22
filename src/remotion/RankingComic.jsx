import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';

/* =============================================================================
 *  Ranking · Estilo BasketData Graphic Comic / Streetball Editorial
 *  - Cero bordes de neón difusos ni resplandores púrpuras.
 *  - Trazos de tinta sólidos (4px - 5px), sombras duras desplazadas (Hard Offset).
 *  - Patrones halftone / cómic y stickers dinámicos angulados.
 *  - Estética streetball / manga deportivo maduro (tipo Bleacher Report / Spider-Verse).
 * ============================================================================= */

const proxiedPhoto = (url) => {
  if (!url) return null;
  if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.includes('imagenes.feb.es')) return `/api/proxy?url=${encodeURIComponent(url)}`;
  return url;
};

// Paleta de colores deportivos planos de alto impacto (sin degradados de neón)
const rankTheme = (rank) => {
  switch (rank) {
    case 1:
      return {
        bgBadge: '#FFB800',
        textColor: '#0F172A',
        accent: '#FF5500',
        label: 'Nº 1 · MVP',
        sticker: '👑 MVP LEADER',
        tagBg: '#FEF08A',
      };
    case 2:
      return {
        bgBadge: '#38BDF8',
        textColor: '#0F172A',
        accent: '#2563EB',
        label: 'TOP 2 · PLATA',
        sticker: '⚡ ELITE BUCKET',
        tagBg: '#BAE6FD',
      };
    case 3:
      return {
        bgBadge: '#FB923C',
        textColor: '#0F172A',
        accent: '#EA580C',
        label: 'TOP 3 · BRONCE',
        sticker: '🔥 ON FIRE',
        tagBg: '#FFEDD5',
      };
    case 4:
      return {
        bgBadge: '#34D399',
        textColor: '#0F172A',
        accent: '#059669',
        label: 'TOP 4',
        sticker: '🎯 CLUTCH',
        tagBg: '#A7F3D0',
      };
    default:
      return {
        bgBadge: '#F43F5E',
        textColor: '#0F172A',
        accent: '#E11D48',
        label: `TOP ${rank}`,
        sticker: '⭐ STAR',
        tagBg: '#FECDD3',
      };
  }
};

export const RankingComic = ({ rankingData }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const { players = [], stat = 'Puntos', title = 'Top Jugadores' } = rankingData || {};
  const framesPerPlayer = 90;

  const headerSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#0F111A', 
      fontFamily: "'Oswald','Poppins',system-ui,sans-serif",
      overflow: 'hidden' 
    }}>
      {/* 1. Fondo Comic Halftone Screen (Trama de puntos de cómic) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(#262B3D 2px, transparent 2px)',
          backgroundSize: '24px 24px',
          opacity: 0.8,
        }}
      />

      {/* 2. Rayos de velocidad en el fondo (Speedlines estilizadas) */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      >
        <line x1="0" y1="0" x2={width} y2={height} stroke="#FFFFFF" strokeWidth="2" strokeDasharray="16 24" />
        <line x1={width} y1="0" x2="0" y2={height} stroke="#FFFFFF" strokeWidth="2" strokeDasharray="16 24" />
        <circle cx={width / 2} cy={height / 2} r="420" stroke="#FF5500" strokeWidth="2" fill="none" opacity="0.2" />
        <circle cx={width / 2} cy={height / 2} r="650" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="12 12" fill="none" opacity="0.15" />
      </svg>

      {/* 3. Encabezado de estilo Revista / Póster Deportivo */}
      <div
        style={{
          position: 'absolute',
          top: vertical ? '4.5%' : '5%',
          left: 0,
          width: '100%',
          textAlign: 'center',
          opacity: headerOpacity,
          transform: `translateY(${(1 - headerSpring) * -40}px)`,
          zIndex: 10,
          padding: '0 40px',
        }}
      >
        {/* Píldora tipo Etiqueta / Parche de Ropa Deportiva */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 24px',
            backgroundColor: '#FF5500',
            border: '3.5px solid #000000',
            borderRadius: 8,
            boxShadow: '4px 4px 0px #000000',
            transform: 'rotate(-1.5deg)',
          }}
        >
          <span style={{ fontSize: vertical ? 26 : 22, fontWeight: 900, color: '#FFFFFF', letterSpacing: 2 }}>
            ★ BASKETDATA RANKING ★
          </span>
        </div>

        {/* Título rotundo tipo Cabecera de Cómic */}
        <h1
          style={{
            fontSize: vertical ? 88 : 72,
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '16px 0 0',
            lineHeight: 1.05,
            letterSpacing: 1,
            textTransform: 'uppercase',
            textShadow: '5px 5px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000',
          }}
        >
          {title}
        </h1>

        {/* Métrica / Subtítulo */}
        <div style={{ marginTop: 8 }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: '#1E2333',
              color: '#F8FAFC',
              border: '2px solid #333C52',
              borderRadius: 6,
              padding: '4px 18px',
              fontSize: vertical ? 28 : 22,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: 'uppercase',
              boxShadow: '3px 3px 0px #000000',
            }}
          >
            {stat}
          </span>
        </div>
      </div>

      {/* 4. Tarjetas de Jugadores (Secuencia animada del último al primero) */}
      {players.map((player, index) => {
        const playerStart = 25 + (players.length - 1 - index) * framesPerPlayer;
        return (
          <Sequence key={index} from={playerStart} durationInFrames={framesPerPlayer}>
            <PlayerComicCard player={player} rank={index + 1} fps={fps} vertical={vertical} stat={stat} />
          </Sequence>
        );
      })}

      {/* 5. Pie de Página con Logotipo Gráfico */}
      <div
        style={{
          position: 'absolute',
          bottom: '2.5%',
          left: 0,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: vertical ? 54 : 44,
            height: vertical ? 54 : 44,
            borderRadius: 12,
            backgroundColor: '#FF5500',
            border: '3px solid #000000',
            boxShadow: '3px 3px 0px #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: vertical ? 28 : 22,
          }}
        >
          🏀
        </div>
        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontSize: vertical ? 28 : 22,
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1,
              letterSpacing: 1,
              textShadow: '2px 2px 0px #000000',
            }}
          >
            BASKETDATA.ES
          </div>
          <div
            style={{
              fontSize: vertical ? 15 : 13,
              fontWeight: 700,
              letterSpacing: 2,
              color: '#94A3B8',
              textTransform: 'uppercase',
            }}
          >
            STREETBALL & PRO DATA
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* =============================================================================
 *  Tarjeta Gráfica Estilo Cómic / Neo-Brutalist Sports
 * ============================================================================= */
const PlayerComicCard = ({ player, rank, fps, vertical, stat = 'Estadística' }) => {
  const frame = useCurrentFrame();
  const theme = rankTheme(rank);
  const photoSize = vertical ? 430 : 310;

  const enterSpring = spring({ frame, fps, config: { damping: 11, stiffness: 120 } });
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [76, 88], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const impactShake = interpolate(frame, [6, 8, 10, 12], [0, -6, 4, 0], { extrapolateRight: 'clamp' });
  const statPop = spring({ frame: frame - 14, fps, config: { damping: 10, stiffness: 140 } });
  const statValue = player.stat_value ?? player.value ?? '0';

  const cardTilt = rank % 2 === 0 ? -1.2 : 1.2;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: opacity * exitOpacity,
        paddingTop: vertical ? '17%' : '8.5%',
        paddingBottom: vertical ? '7.5%' : '6.5%',
      }}
    >
      <div
        style={{
          width: vertical ? '88%' : '78%',
          maxWidth: vertical ? 960 : 1400,
          height: '100%',
          backgroundColor: '#FAF9F6',
          border: '5px solid #000000',
          borderRadius: 28,
          boxShadow: '14px 14px 0px #000000',
          transform: `translateY(${(1 - enterSpring) * 110 + impactShake}px) rotate(${cardTilt}deg) scale(${0.92 + enterSpring * 0.08})`,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: vertical ? '36px 36px 28px' : '32px 48px',
        }}
      >
        {/* Número de fondo tipo marca de agua */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -20,
            fontSize: vertical ? 460 : 320,
            fontWeight: 900,
            color: '#000000',
            opacity: 0.05,
            lineHeight: 0.85,
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: "'Oswald', sans-serif",
          }}
        >
          #{rank}
        </div>

        {/* Fila Superior: Badges de Puesto y Sticker Estilo Parche */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 4,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: theme.bgBadge,
              border: '3.5px solid #000000',
              borderRadius: 12,
              padding: '8px 24px',
              boxShadow: '5px 5px 0px #000000',
              transform: 'rotate(-2.5deg)',
            }}
          >
            <span
              style={{
                fontSize: vertical ? 46 : 36,
                fontWeight: 900,
                color: theme.textColor,
                lineHeight: 1,
              }}
            >
              #{rank}
            </span>
            <span
              style={{
                fontSize: vertical ? 24 : 20,
                fontWeight: 800,
                color: theme.textColor,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              {theme.label}
            </span>
          </div>

          <div
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: '3px solid #000000',
              borderRadius: 8,
              padding: '6px 18px',
              fontSize: vertical ? 20 : 16,
              fontWeight: 900,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              boxShadow: '4px 4px 0px #000000',
              transform: 'rotate(3deg)',
            }}
          >
            {theme.sticker}
          </div>
        </div>

        {/* Retrato del Jugador */}
        <div
          style={{
            position: 'relative',
            margin: vertical ? '20px 0 10px' : '10px 0',
            zIndex: 3,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: -16,
              borderRadius: '50%',
              backgroundColor: theme.accent,
              border: '4px solid #000000',
              boxShadow: '6px 6px 0px #000000',
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: 'relative',
              width: photoSize,
              height: photoSize,
              borderRadius: '50%',
              border: '6px solid #000000',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
              zIndex: 2,
            }}
          >
            {(player.photo_url || player.photo) ? (
              <img
                src={proxiedPhoto(player.photo_url || player.photo)}
                alt={player.name}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FF5500',
                  color: '#FFFFFF',
                  fontSize: photoSize * 0.4,
                  fontWeight: 900,
                }}
              >
                {player.name?.charAt(0) || '🏀'}
              </div>
            )}
          </div>
        </div>

        {/* Nombre del Jugador y Club */}
        <div style={{ textAlign: 'center', zIndex: 4, width: '100%' }}>
          <h2
            style={{
              fontSize: (player.name || '').length > 18 ? (vertical ? 58 : 50) : (vertical ? 74 : 64),
              fontWeight: 900,
              color: '#0F172A',
              margin: 0,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontFamily: "'Oswald', sans-serif",
            }}
          >
            {player.name || 'Jugador'}
          </h2>

          <div style={{ marginTop: 8 }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: theme.tagBg,
                color: '#0F172A',
                border: '2.5px solid #000000',
                borderRadius: 6,
                padding: '4px 18px',
                fontSize: vertical ? 26 : 22,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                boxShadow: '3px 3px 0px #000000',
              }}
            >
              {player.team_name || player.team || 'Equipo'}
            </span>
          </div>
        </div>

        {/* Bloque de Estadística */}
        <div
          style={{
            width: '100%',
            backgroundColor: theme.accent,
            border: '4.5px solid #000000',
            borderRadius: 20,
            padding: vertical ? '16px 20px 14px' : '16px 30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '8px 8px 0px #000000',
            zIndex: 4,
            transform: `scale(${0.9 + statPop * 0.1})`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: vertical ? 134 : 108,
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 0.92,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: 1,
              textShadow: '4px 4px 0px #000000',
            }}
          >
            {statValue}
          </span>
          <span
            style={{
              fontSize: vertical ? 24 : 20,
              fontWeight: 900,
              letterSpacing: 3,
              color: '#000000',
              backgroundColor: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: 6,
              padding: '3px 16px',
              textTransform: 'uppercase',
              marginTop: 8,
              boxShadow: '2px 2px 0px #000000',
            }}
          >
            {player.stat_label || stat}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default RankingComic;
