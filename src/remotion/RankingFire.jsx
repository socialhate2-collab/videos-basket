import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';

const proxiedPhoto = (url) => {
  if (!url) return null;
  if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.includes('imagenes.feb.es')) return `/api/proxy?url=${encodeURIComponent(url)}`;
  return url;
};

export const RankingFire = ({ rankingData }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const { players = [], stat = 'Puntos', title = 'Top Jugadores' } = rankingData;

  const framesPerPlayer = 90;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0000' }}>
      {/* Animated Fire Background */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at ${30 + Math.sin(frame * 0.05) * 10}% ${50 + Math.cos(frame * 0.03) * 10}%, 
          rgba(255, 60, 0, 0.4) 0%, 
          rgba(255, 140, 0, 0.2) 20%, 
          rgba(139, 0, 0, 0.1) 40%, 
          transparent 70%)
        `,
        filter: 'blur(60px)',
      }} />

      {/* Fire particles */}
      {[...Array(20)].map((_, i) => (
        <FireParticle key={i} index={i} frame={frame} />
      ))}

      {/* Explosion rings */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}>
        {[...Array(3)].map((_, i) => {
          const ringFrame = (frame + i * 30) % 120;
          const scale = interpolate(ringFrame, [0, 120], [0.5, 3]);
          const opacity = interpolate(ringFrame, [0, 60, 120], [0.5, 0.3, 0]);
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${scale})`,
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                border: '3px solid rgba(255, 100, 0, 0.6)',
                opacity,
                boxShadow: '0 0 60px rgba(255, 60, 0, 0.8), inset 0 0 60px rgba(255, 140, 0, 0.4)',
              }}
            />
          );
        })}
      </div>

      {/* Title with fire effect */}
      <div style={{
        position: 'absolute',
        top: vertical ? '4%' : '50px',
        width: '100%',
        textAlign: 'center',
        opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
        zIndex: 5,
        padding: '0 24px',
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Glow layers */}
          <h1 style={{
            position: 'absolute',
            fontSize: vertical ? '62px' : '72px',
            fontWeight: 'black',
            color: '#ff3c00',
            textTransform: 'uppercase',
            letterSpacing: '6px',
            margin: 0,
            filter: 'blur(20px)',
            opacity: 0.8,
          }}>
            {title}
          </h1>
          <h1 style={{
            position: 'relative',
            fontSize: vertical ? '62px' : '72px',
            fontWeight: 'black',
            background: 'linear-gradient(180deg, #fff700 0%, #ff8c00 30%, #ff3c00 60%, #8b0000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '6px',
            margin: 0,
            textShadow: '0 0 30px rgba(255, 60, 0, 0.8)',
            animation: `flicker ${2 + Math.random()}s infinite`,
          }}>
            {title}
          </h1>
        </div>
        <p style={{
          color: '#ff8c00',
          fontSize: vertical ? '26px' : '28px',
          marginTop: '12px',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          textShadow: '0 0 20px rgba(255, 140, 0, 0.8)',
        }}>
          🔥 {stat} 🔥
        </p>
      </div>

      {/* Players */}
      {players.map((player, index) => {
        const playerStart = 30 + (players.length - 1 - index) * framesPerPlayer;
        
        return (
          <Sequence key={index} from={playerStart} durationInFrames={framesPerPlayer}>
            <PlayerCardFire 
              player={player} 
              rank={index + 1}
              fps={fps}
              vertical={vertical}
              stat={stat}
            />
          </Sequence>
        );
      })}

      {/* BasketData Logo with fire */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '40px',
      }}>
        <span style={{
          color: '#ff8c00',
          fontSize: '24px',
          fontWeight: 'bold',
          textShadow: '0 0 20px rgba(255, 140, 0, 0.8)',
        }}>
          🔥 BasketData
        </span>
      </div>

      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
      `}</style>
    </AbsoluteFill>
  );
};

// Fire Particle Component
const FireParticle = ({ index, frame }) => {
  const startDelay = index * 5;
  const particleLife = 180;
  const particleFrame = (frame - startDelay) % particleLife;
  
  const x = 10 + (index * 5) % 90;
  const y = interpolate(particleFrame, [0, particleLife], [110, -10], { extrapolateRight: 'clamp' });
  const opacity = interpolate(particleFrame, [0, particleLife * 0.3, particleLife * 0.7, particleLife], [0, 1, 0.8, 0]);
  const size = 4 + (index % 3) * 2;
  
  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size * 3}px`,
      background: 'linear-gradient(180deg, #fff700 0%, #ff8c00 50%, transparent 100%)',
      borderRadius: '50%',
      opacity,
      filter: 'blur(2px)',
      boxShadow: '0 0 10px rgba(255, 140, 0, 0.8)',
    }} />
  );
};

// Player Card with Fire Effects
const PlayerCardFire = ({ player, rank, fps, vertical = false, stat = 'Puntos' }) => {
  const frame = useCurrentFrame();
  
  const slideIn = spring({ frame, fps, config: { damping: 15 } });
  const explosion = spring({ frame, fps, config: { damping: 8 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  
  const getRankColor = () => {
    if (rank === 1) return { 
      primary: '#fff700', 
      secondary: '#ff8c00',
      tertiary: '#ff3c00',
      glow: 'rgba(255, 247, 0, 0.9)'
    };
    if (rank === 2) return { 
      primary: '#ff8c00', 
      secondary: '#ff6600',
      tertiary: '#ff3c00',
      glow: 'rgba(255, 140, 0, 0.8)'
    };
    if (rank === 3) return { 
      primary: '#ff6600', 
      secondary: '#ff3c00',
      tertiary: '#8b0000',
      glow: 'rgba(255, 102, 0, 0.7)'
    };
    return { 
      primary: '#ff3c00', 
      secondary: '#8b0000',
      tertiary: '#4a0000',
      glow: 'rgba(255, 60, 0, 0.6)'
    };
  };

  const colors = getRankColor();
  const photoSize = vertical ? 340 : 300;

  return (
    <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: vertical ? '16%' : '0px',
      paddingBottom: vertical ? '6%' : '0px',
      opacity,
    }}>
      {/* Explosion effect at entry */}
      {frame < 20 && (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '100px',
                height: '4px',
                background: `linear-gradient(90deg, ${colors.primary}, transparent)`,
                transform: `rotate(${i * 30}deg) translateX(${explosion * 300}px)`,
                opacity: 1 - explosion,
                filter: 'blur(2px)',
              }}
            />
          ))}
        </>
      )}

      {/* Main Card */}
      <div style={{
        width: vertical ? '90%' : '1000px',
        maxWidth: vertical ? '960px' : '1000px',
        height: vertical ? 'auto' : '550px',
        background: `linear-gradient(135deg, #1a0000 0%, #0a0000 100%)`,
        borderRadius: '40px',
        border: `5px solid ${colors.primary}`,
        boxShadow: `
          0 0 80px ${colors.glow},
          0 0 120px ${colors.glow},
          inset 0 0 60px rgba(255, 60, 0, 0.2),
          0 30px 80px rgba(0, 0, 0, 0.8)
        `,
        transform: `translateX(${(1 - slideIn) * -200}px) scale(${slideIn}) rotateY(${(1 - slideIn) * -15}deg)`,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Animated fire border */}
        <div style={{
          position: 'absolute',
          inset: '-3px',
          background: `linear-gradient(${frame * 3}deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary}, ${colors.primary})`,
          borderRadius: '40px',
          opacity: 0.6,
          filter: 'blur(8px)',
          zIndex: -1,
        }} />

        {/* Rank Number - Huge watermark */}
        <div style={{
          position: 'absolute',
          top: vertical ? '-50px' : '-40px',
          right: vertical ? '-20px' : 'auto',
          left: vertical ? 'auto' : '40px',
          fontSize: vertical ? '320px' : '220px',
          fontWeight: 'black',
          background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.tertiary} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: 0.15,
          lineHeight: 1,
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }}>
          #{rank}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          height: '100%',
          padding: vertical ? '40px 36px 36px' : '50px',
          gap: vertical ? '24px' : '60px',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Player Photo with Fire Ring */}
          <div style={{
            position: 'relative',
            flexShrink: 0,
          }}>
            {/* Rotating fire ring */}
            <div style={{
              position: 'absolute',
              width: `${photoSize + 60}px`,
              height: `${photoSize + 60}px`,
              borderRadius: '50%',
              background: `conic-gradient(from ${frame * 5}deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary}, ${colors.primary})`,
              filter: 'blur(15px)',
              opacity: 0.8,
              transform: 'translate(-50%, -50%)',
              top: '50%',
              left: '50%',
            }} />
            
            {/* Pulsing glow */}
            <div style={{
              position: 'absolute',
              width: `${photoSize + 20}px`,
              height: `${photoSize + 20}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              filter: 'blur(36px)',
              opacity: 0.5 + Math.sin(frame * 0.1) * 0.3,
              transform: 'translate(-50%, -50%)',
              top: '50%',
              left: '50%',
            }} />

            {/* Photo container */}
            <div style={{
              width: `${photoSize}px`,
              height: `${photoSize}px`,
              borderRadius: '50%',
              overflow: 'hidden',
              border: `8px solid ${colors.primary}`,
              boxShadow: `
                0 0 60px ${colors.glow},
                inset 0 0 40px rgba(255, 60, 0, 0.3)
              `,
              position: 'relative',
            }}>
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
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${colors.secondary} 0%, #0a0000 100%)`,
                  fontSize: '100px',
                  fontWeight: 'bold',
                  color: colors.primary,
                }}>
                  {player.name?.charAt(0) || '?'}
                </div>
              )}
            </div>

            {/* Rank badge with fire */}
            <div style={{
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              padding: vertical ? '8px 28px' : '12px 35px',
              borderRadius: '30px',
              boxShadow: `0 0 40px ${colors.glow}, 0 10px 30px rgba(0, 0, 0, 0.8)`,
              border: `3px solid ${colors.tertiary}`,
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                color: '#000',
                fontSize: vertical ? '30px' : '36px',
                fontWeight: 'black',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}>
                #{rank}
              </span>
            </div>
          </div>

          {/* Player Info */}
          <div style={{ flex: 1, width: '100%', textAlign: vertical ? 'center' : 'left' }}>
            {/* Player Name with fire effect */}
            <div style={{ position: 'relative', marginBottom: vertical ? '8px' : '15px' }}>
              <h2 style={{
                position: 'absolute',
                left: vertical ? '50%' : '0',
                transform: vertical ? 'translateX(-50%)' : 'none',
                width: '100%',
                fontSize: (player.name || '').length > 18 ? (vertical ? '48px' : '52px') : (vertical ? '58px' : '64px'),
                fontWeight: 'black',
                color: colors.primary,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: 1.1,
                filter: 'blur(15px)',
                opacity: 0.6,
              }}>
                {player.name || 'Jugador'}
              </h2>
              <h2 style={{
                position: 'relative',
                fontSize: (player.name || '').length > 18 ? (vertical ? '48px' : '52px') : (vertical ? '58px' : '64px'),
                fontWeight: 'black',
                background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.tertiary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: 1.1,
                textShadow: `0 0 30px ${colors.glow}`,
              }}>
                {player.name || 'Jugador'}
              </h2>
            </div>

            {/* Team Name */}
            <p style={{
              fontSize: vertical ? '24px' : '28px',
              color: colors.secondary,
              margin: vertical ? '0 0 20px 0' : '0 0 50px 0',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: `0 0 20px ${colors.glow}`,
              fontWeight: 700,
            }}>
              🔥 {player.team || player.team_name || 'Equipo FEB'}
            </p>

            {/* Stat Value - Massive with fire */}
            <div style={{
              background: `linear-gradient(135deg, rgba(255, 60, 0, 0.2) 0%, rgba(139, 0, 0, 0.1) 100%)`,
              borderRadius: '24px',
              padding: vertical ? '22px 24px 20px' : '40px',
              border: `3px solid ${colors.primary}`,
              boxShadow: `
                0 0 40px ${colors.glow},
                inset 0 0 40px rgba(255, 60, 0, 0.2)
              `,
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
              width: '100%',
              textAlign: 'center',
            }}>
              {/* Animated gradient overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(${frame * 2}deg, transparent, rgba(255, 140, 0, 0.1), transparent)`,
                opacity: 0.5,
              }} />
              
              <div style={{
                fontSize: vertical ? '20px' : '24px',
                color: '#ff8c00',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                position: 'relative',
                fontWeight: 800,
              }}>
                {player.stat_label || stat || 'Estadística'}
              </div>
              <div style={{
                fontSize: vertical ? '110px' : '100px',
                fontWeight: 'black',
                background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                position: 'relative',
                textShadow: `0 0 60px ${colors.glow}`,
              }}>
                {player.stat_value ?? player.value ?? '0'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
