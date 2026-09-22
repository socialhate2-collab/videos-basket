import React, { useState } from 'react';
import { 
  MessageSquareText, 
  Copy, 
  Check, 
  Sparkles, 
  Send, 
  Flame, 
  Hash, 
  Share2,
  RefreshCw
} from 'lucide-react';
import { SAMPLE_PLAYERS, SAMPLE_MATCHES } from '../data/mockBasketData';

export const SocialCopysStudio: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(SAMPLE_PLAYERS[0]);
  const [selectedMatch, setSelectedMatch] = useState(SAMPLE_MATCHES[0]);
  const [copyType, setCopyType] = useState<'player' | 'match' | 'debate'>('player');
  const [platform, setPlatform] = useState<'tiktok' | 'instagram' | 'twitter'>('tiktok');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getCopyText = () => {
    if (copyType === 'player') {
      if (platform === 'tiktok') {
        return `⚠️ ¿EL JUGADOR MÁS INFRAVALORADO DE LA LIGA? 🏀

Este es ${selectedPlayer.cleanName} jugando para ${selectedPlayer.team}.
Y estos números no tienen ningún sentido:

📈 BD Score: ${selectedPlayer.bd_score}/100
🔥 ${selectedPlayer.points} PTS/partido (${selectedPlayer.pts_36} PTS proyectados a 36 min)
🎯 True Shooting%: ${selectedPlayer.ts_pct}%
⚡ Insignias: ${selectedPlayer.badges.join(' · ')}

¿Le ves nivel para dar el salto a una categoría superior?
Comenta si crees que su entrenador debería darle aún más minutos 👇

#BasketData #Baloncesto #FEB #LEBOro #Scouting #BasketLovers #Highlights`;
      }
      if (platform === 'instagram') {
        return `🔥 RADAR DE TALENTO | ${selectedPlayer.cleanName.toUpperCase()} (${selectedPlayer.team})

El impacto de ${selectedPlayer.cleanName} esta temporada está redefiniendo el juego de su equipo según los algoritmos analíticos de BasketData:

📊 MÉTRICAS AVANZADAS:
• Puntos por partido: ${selectedPlayer.points} (${selectedPlayer.pts_36} pts/36)
• Rebotes totales: ${selectedPlayer.rebounds} (${selectedPlayer.reb_36} reb/36)
• Asistencias: ${selectedPlayer.assists}
• Valoración media: ${selectedPlayer.valuation}
• Eficiencia anotadora (TS%): ${selectedPlayer.ts_pct}%

🏆 BD Score Oficial: ${selectedPlayer.bd_score}/100 ${selectedPlayer.trend > 0 ? `(Tendencia al alza +${selectedPlayer.trend})` : ''}

👉 Consulta su mapa de tiro interactivo y scout completo gratis en basketdata.es

#BasketData #FEBBaloncesto #LigaEndesa #LEBOro #ScoutingFEB #BaloncestoEspanol #BasketballAnalytics`;
      }
      return `¿Es ${selectedPlayer.cleanName} (${selectedPlayer.team}) el jugador más determinante de la liga ahora mismo?

📊 ${selectedPlayer.points} PTS | ${selectedPlayer.rebounds} REB | ${selectedPlayer.valuation} VAL
🎯 ${selectedPlayer.ts_pct}% True Shooting
⭐ BD Score: ${selectedPlayer.bd_score}/100

Todos sus datos en @basketdata_app 👇`;
    }

    if (copyType === 'match') {
      return `🚨 FINAL DEL PARTIDO | ${selectedMatch.home_team} ${selectedMatch.home_score} - ${selectedMatch.away_score} ${selectedMatch.away_team}

Partidazo de alto ritmo en la competición:
⭐ MVP de la jornada: ${selectedMatch.mvp_name}
📊 Línea estadística: ${selectedMatch.mvp_stats}
🏀 Puntos totales combinados: ${selectedMatch.total_points}

Análisis completo de posesiones, +/- y rachas disponible en BasketData Studio.

#BasketData #ResultadosFEB #Baloncesto #Matchday`;
    }

    return `🔥 DEBATE ABIERTO: ¿Quién domina mejor los tiempos de juego?

¿A qué tipo de jugador prefieres en tu equipo en el minuto final?
1️⃣ Anotador puro con alto volumen de tiro (${selectedPlayer.cleanName})
2️⃣ Base director con ratio asistencia/pérdida élite

Los datos analíticos del BD Score nos dan una respuesta clara. Descúbrelo en basketdata.es 📊`;
  };

  const currentCopy = getCopyText();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCopy);
    setCopiedKey(platform);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="social-copys-studio">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-yellow-500/20 border border-orange-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider font-mono">
            Generador de Copys y Textos Virales
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Poppins']">
            Textos para Redes Sociales con Datos Reales
          </h2>
          <p className="text-xs sm:text-sm text-white/70 mt-1 font-['Inter']">
            Genera al instante descripciones con gancho, emojis, estadísticas calculadas y hashtags de baloncesto español.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Settings */}
        <div className="lg:col-span-5 bg-[#111022] border border-white/10 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white font-['Poppins'] flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-orange-400" /> Configurar Post
          </h3>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 font-['Inter']">
              Tipo de Publicación
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'player', label: 'Jugador' },
                { id: 'match', label: 'Partido' },
                { id: 'debate', label: 'Debate' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCopyType(t.id as any)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    copyType === t.id
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-black/30 text-white/60 border-white/5 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 font-['Inter']">
              Plataforma Destino
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tiktok', label: 'TikTok' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'twitter', label: 'X / Twitter' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id as any)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    platform === p.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500'
                      : 'bg-black/30 text-white/60 border-white/5 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {copyType === 'player' && (
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 font-['Inter']">
                Seleccionar Jugador
              </label>
              <select
                value={selectedPlayer.id}
                onChange={(e) => {
                  const p = SAMPLE_PLAYERS.find((x) => x.id === e.target.value);
                  if (p) setSelectedPlayer(p);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
              >
                {SAMPLE_PLAYERS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#111022]">
                    {p.cleanName} ({p.team})
                  </option>
                ))}
              </select>
            </div>
          )}

          {copyType === 'match' && (
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 font-['Inter']">
                Seleccionar Partido
              </label>
              <select
                value={selectedMatch.id}
                onChange={(e) => {
                  const m = SAMPLE_MATCHES.find((x) => x.id === e.target.value);
                  if (m) setSelectedMatch(m);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
              >
                {SAMPLE_MATCHES.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#111022]">
                    {m.home_team} vs {m.away_team}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Output Textarea */}
        <div className="lg:col-span-7 bg-[#111022] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
              <span className="text-xs font-bold text-white font-mono uppercase">
                Texto Generado ({platform.toUpperCase()})
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all"
            >
              {copiedKey === platform ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              {copiedKey === platform ? '¡Copiado al Portapapeles!' : 'Copiar Texto'}
            </button>
          </div>

          <textarea
            readOnly
            value={currentCopy}
            rows={12}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-white font-mono leading-relaxed focus:outline-none resize-none"
          />

          <div className="text-[11px] text-white/40 flex items-center gap-2 font-['Inter']">
            <span>💡 Listo para pegar directamente en la descripción del vídeo o publicación social.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
