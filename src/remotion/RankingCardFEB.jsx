import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';

/* =============================================================================
 *  Ranking · Estilo Carta Digital FEB (BasketData Official Card Design)
 *  Inspirado fielmente en la interfaz y cartas digitales de BasketData:
 *  - Fondo Midnight Navy profundo (#0A0E17) con acentos limpios.
 *  - Tipografía moderna sans-serif (Plus Jakarta / Inter) con jerarquía clara.
 *  - Carta física digital de dos tonos: Cabecera Naranja BasketData (#FF5500)
 *    con BD Score, badge "+3 pts", trofeo TOP, y cuerpo Midnight (#101728)
 *    con insignias (Francotirador, Muro Defensivo, Manos Rápidas), estadísticas
 *    (PTS, REB, AST, VAL) y sello oficial "● VERIFICADO".
 * ============================================================================= */

const proxiedPhoto = (url) => {
  if (!url) return null;
  if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.includes('imagenes.feb.es')) return `/api/proxy?url=${encodeURIComponent(url)}`;
  return url;
};

// Insignias según posición en el ranking
const getPlayerBadges = (rank) => {
  if (rank === 1) {
    return [
      { name: 'FRANCOTIRADOR', icon: '🎯', color: '#FBBF24' },
      { name: 'MURO DEFENSIVO', icon: '🛡️', color: '#60A5FA' },
      { name: 'CLUTCH KING', icon: '👑', color: '#F59E0B' },
    ];
  }
  if (rank === 2) {
    return [
      { name: 'MANOS RÁPIDAS', icon: '⚡', color: '#38BDF8' },
      { name: 'ANOTADOR', icon: '🔥', color: '#FB923C' },
      { name: 'DIRECTOR', icon: '🧠', color: '#A78BFA' },
    ];
  }
  if (rank === 3) {
    return [
      { name: '100 PUNTOS', icon: '🔥', color: '#F87171' },
      { name: 'REBOTEADOR', icon: '💪', color: '#34D399' },
      { name: 'MOTOR', icon: '⚙️', color: '#FBBF24' },
    ];
  }
  return [
    { name: 'ANOTADOR', icon: '🎯', color: '#FB923C' },
    { name: 'DEFENSA', icon: '🛡️', color: '#60A5FA' },
    { name: 'PLAYMAKER', icon: '⚡', color: '#34D399' },
  ];
};

export const RankingCardFEB = ({ rankingData }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const { players = [], stat = 'Puntos', title = 'Top Jugadores' } = rankingData || {};
  const framesPerPlayer = 90;

  const headerSpring = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Calcular índice del jugador actual en pantalla
  const currentPlayerIdx = Math.min(
    players.length - 1,
    Math.max(0, players.length - 1 - Math.floor(Math.max(0, frame - 25) / framesPerPlayer))
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#090D16',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
        color: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* Sutil resplandor de fondo naranja y azul medianoche */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -100,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,85,0,0.12) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -150,
          left: -100,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* ENCABEZADO SUPERIOR: Estilo "¿Tu perfil? Tu carta. Tu momento." */}
      <div
        style={{
          position: 'absolute',
          top: vertical ? '4%' : '4.5%',
          left: 0,
          width: '100%',
          textAlign: 'center',
          opacity: headerOpacity,
          transform: `translateY(${(1 - headerSpring) * -30}px)`,
          zIndex: 10,
          padding: '0 40px',
        }}
      >
        {/* Pill de categoría oficial */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 20px',
            borderRadius: 9999,
            backgroundColor: 'rgba(255,85,0,0.12)',
            border: '1px solid rgba(255,85,0,0.3)',
            marginBottom: 12,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FF5500' }} />
          <span
            style={{
              fontSize: vertical ? 22 : 18,
              fontWeight: 800,
              color: '#FF772A',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            RANKING OFICIAL FEB · CARTA DIGITAL
          </span>
        </div>

        {/* Gran titular limpio */}
        <h1
          style={{
            fontSize: vertical ? 74 : 58,
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '6px 0 0',
            lineHeight: 1.1,
            letterSpacing: -0.5,
          }}
        >
          TOP {players.length} <span style={{ color: '#FF5500' }}>{title}</span>
        </h1>

        <p
          style={{
            fontSize: vertical ? 28 : 22,
            color: '#94A3B8',
            marginTop: 6,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Métrica oficial: <strong style={{ color: '#FFFFFF' }}>{stat}</strong>
        </p>
      </div>

      {/* Tarjetas en secuencia (del último al primero) */}
      {players.map((player, index) => {
        const playerStart = 25 + (players.length - 1 - index) * framesPerPlayer;
        return (
          <Sequence key={index} from={playerStart} durationInFrames={framesPerPlayer}>
            <FEBCardPlayer
              player={player}
              rank={index + 1}
              totalPlayers={players.length}
              fps={fps}
              vertical={vertical}
              stat={stat}
            />
          </Sequence>
        );
      })}

      {/* PIE DE MARCA OFICIAL BASKETDATA */}
      <div
        style={{
          position: 'absolute',
          bottom: '2.8%',
          left: 0,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 24px',
            backgroundColor: 'rgba(16,23,40,0.8)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 9999,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: '#FF5500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            🏀
          </div>
          <span style={{ fontSize: vertical ? 22 : 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: 1.5 }}>
            BASKETDATA<span style={{ color: '#FF5500' }}>.ES</span>
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>|</span>
          <span style={{ fontSize: vertical ? 18 : 15, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
            VERIFICADO FEB
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* =============================================================================
 *  Componente: Carta Digital FEB Individual (Réplica del mockup oficial)
 * ============================================================================= */
const FEBCardPlayer = ({ player, rank, totalPlayers, fps, vertical, stat }) => {
  const frame = useCurrentFrame();

  const enterSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [76, 88], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Puntuación BD Score o Estadística
  const bdScore = player.bd_score || Math.min(99, Math.max(70, Math.round(Number(player.stat_value || 82) * 2.8)));
  const statValue = player.stat_value ?? '0';
  const badges = getPlayerBadges(rank);

  // Ancho y alto de la carta según orientación
  const cardWidth = vertical ? 820 : 640;

  // Etiqueta del puesto
  const rankTag = rank === 1 ? 'MVP LIGA' : rank === 2 ? 'TOP 2 ANOTADOR' : rank === 3 ? 'TOP 3 LIGA' : `TOP #${rank} LIGA`;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: opacity * exitOpacity,
        paddingTop: vertical ? '15%' : '7%',
        paddingBottom: vertical ? '6%' : '5%',
      }}
    >
      <div
        style={{
          width: cardWidth,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${(1 - enterSpring) * 60}px) scale(${0.93 + enterSpring * 0.07})`,
        }}
      >
        {/* CHIP DE RANKING FLOTANTE (Como los botones a la izquierda del screenshot) */}
        <div
          style={{
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '10px 28px',
            backgroundColor: '#111726',
            border: rank === 1 ? '2px solid #FF5500' : '1.5px solid rgba(255,255,255,0.12)',
            borderRadius: 16,
            boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
          }}
        >
          <span
            style={{
              fontSize: vertical ? 44 : 36,
              fontWeight: 900,
              color: '#FF5500',
              lineHeight: 1,
            }}
          >
            #{rank}
          </span>
          <div style={{ textAlign: 'left' }}>
            <span
              style={{
                fontSize: vertical ? 22 : 18,
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                display: 'block',
              }}
            >
              {rankTag}
            </span>
            <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>CARTA DIGITAL VERIFICADA</span>
          </div>
        </div>

        {/* LA CARTA DIGITAL (El contenedor de dos tonos) */}
        <div
          style={{
            width: '100%',
            borderRadius: 32,
            overflow: 'hidden',
            backgroundColor: '#0F1523',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow:
              '0 30px 80px -15px rgba(0,0,0,0.9), 0 0 50px rgba(255,85,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* SECCIÓN SUPERIOR DE LA CARTA: BLOQUE NARANJA BRILLANTE */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#FF5500',
              padding: vertical ? '36px 40px 32px' : '26px 32px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Patrón sutil geométrico en la parte naranja */}
            <div
              style={{
                position: 'absolute',
                top: -50,
                right: 80,
                width: 220,
                height: 220,
                borderRadius: '50%',
                border: '24px solid rgba(255,255,255,0.08)',
                pointerEvents: 'none',
              }}
            />

            {/* Parte izquierda: BD Score + Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', zIndex: 2 }}>
              <span
                style={{
                  fontSize: vertical ? 18 : 15,
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: 2.5,
                  textTransform: 'uppercase',
                }}
              >
                BD SCORE
              </span>

              {/* Número grande con badge +3 pts */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '2px 0 8px' }}>
                <span
                  style={{
                    fontSize: vertical ? 110 : 88,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 0.9,
                    letterSpacing: -1,
                  }}
                >
                  {bdScore}
                </span>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#10B981',
                    borderRadius: 9999,
                    padding: '6px 14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>↑</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>+3 pts</span>
                </div>
              </div>

              {/* Badge dorado TOP */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  alignSelf: 'flex-start',
                  backgroundColor: '#FEF08A',
                  color: '#854D0E',
                  borderRadius: 9999,
                  padding: '4px 16px',
                  fontSize: vertical ? 18 : 15,
                  fontWeight: 900,
                  letterSpacing: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <span>🏆</span> TOP
              </div>
            </div>

            {/* Parte derecha: Foto del jugador en marco redondeado blanco */}
            <div
              style={{
                width: vertical ? 200 : 160,
                height: vertical ? 220 : 180,
                borderRadius: 24,
                backgroundColor: '#FFFFFF',
                border: '4px solid #FFFFFF',
                boxShadow: '0 14px 30px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                zIndex: 2,
                flexShrink: 0,
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
                    backgroundColor: '#E2E8F0',
                    color: '#FF5500',
                    fontSize: 48,
                    fontWeight: 900,
                  }}
                >
                  {player.name?.charAt(0) || '🏀'}
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN INFERIOR DE LA CARTA: CUERPO MIDNIGHT NAVY */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#0F1523',
              padding: vertical ? '32px 36px 28px' : '22px 28px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: vertical ? 22 : 16,
            }}
          >
            {/* Nombre del jugador y subtítulo de liga/equipo */}
            <div style={{ textAlign: 'left' }}>
              <h2
                style={{
                  fontSize: vertical ? 38 : 30,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: 1.1,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {player.name || 'JUGADOR'}
              </h2>
              <p
                style={{
                  fontSize: vertical ? 18 : 14,
                  fontWeight: 700,
                  color: '#7DD3FC',
                  margin: '6px 0 0',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}
              >
                {player.position || 'JUGADOR'} · #{player.number || rank * 3} · {player.team_name || player.team || 'CLUB FEB'}
              </p>
            </div>

            {/* Fila de Insignias / Badges (Hexágonos/Escudos) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                padding: vertical ? '16px 0' : '10px 0',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {badges.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 4px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    style={{
                      width: vertical ? 44 : 36,
                      height: vertical ? 44 : 36,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${b.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: vertical ? 20 : 16,
                    }}
                  >
                    {b.icon}
                  </div>
                  <span
                    style={{
                      fontSize: vertical ? 12 : 10,
                      fontWeight: 800,
                      color: '#94A3B8',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                    }}
                  >
                    {b.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Fila de 4 Estadísticas Clave: PTS, REB, AST, VAL */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                textAlign: 'center',
                paddingTop: 4,
              }}
            >
              <div>
                <div style={{ fontSize: vertical ? 40 : 32, fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                  {statValue}
                </div>
                <div style={{ fontSize: vertical ? 15 : 12, fontWeight: 800, color: '#FF5500', marginTop: 4, letterSpacing: 1 }}>
                  {stat.toUpperCase()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: vertical ? 40 : 32, fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                  {player.rebounds || Math.max(3, Math.round(Number(statValue) * 0.4))}
                </div>
                <div style={{ fontSize: vertical ? 15 : 12, fontWeight: 800, color: '#94A3B8', marginTop: 4, letterSpacing: 1 }}>
                  REB
                </div>
              </div>

              <div>
                <div style={{ fontSize: vertical ? 40 : 32, fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                  {player.assists || Math.max(2, Math.round(Number(statValue) * 0.3))}
                </div>
                <div style={{ fontSize: vertical ? 15 : 12, fontWeight: 800, color: '#94A3B8', marginTop: 4, letterSpacing: 1 }}>
                  AST
                </div>
              </div>

              <div>
                <div style={{ fontSize: vertical ? 40 : 32, fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                  {player.efficiency || Math.max(12, Math.round(Number(statValue) * 1.35))}
                </div>
                <div style={{ fontSize: vertical ? 15 : 12, fontWeight: 800, color: '#10B981', marginTop: 4, letterSpacing: 1 }}>
                  VAL
                </div>
              </div>
            </div>

            {/* Pie de la Carta: BASKETDATA · ● VERIFICADO */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                style={{
                  fontSize: vertical ? 16 : 13,
                  fontWeight: 900,
                  color: '#FF5500',
                  letterSpacing: 2,
                }}
              >
                BASKETDATA
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    boxShadow: '0 0 8px #10B981',
                  }}
                />
                <span
                  style={{
                    fontSize: vertical ? 14 : 12,
                    fontWeight: 800,
                    color: '#10B981',
                    letterSpacing: 1.5,
                  }}
                >
                  VERIFICADO
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador inferior "PULSA PARA GIRAR LA CARTA" */}
        <div
          style={{
            marginTop: 18,
            fontSize: vertical ? 16 : 13,
            fontWeight: 800,
            letterSpacing: 3,
            color: '#64748B',
            textTransform: 'uppercase',
          }}
        >
          CARTA DIGITAL OFICIAL FEB · BASKETDATA
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default RankingCardFEB;
