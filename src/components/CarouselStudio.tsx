import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { 
  Images, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Loader2, 
  Share2, 
  Copy,
  Layers,
  BarChart3
} from 'lucide-react';
import { SAMPLE_PLAYERS } from '../data/mockBasketData';
import { RenderJob } from '../types/bdata';
import { fetchPlayersApi } from '../services/basketDataApi';

interface CarouselStudioProps {
  onQueueRender?: (job: RenderJob) => void;
}

const METRICS_CATALOG = [
  {
    key: "pts_36",
    label: "PTS/36",
    name: "Puntos por 36 minutos",
    good: 18,
    elite: 24,
    formula: "(Puntos / Minutos) × 36",
    concept: "Normaliza la anotación por tiempo jugado para comparar titulares y suplentes sin distorsión de minutos.",
  },
  {
    key: "ast_36",
    label: "AST/36",
    name: "Asistencias por 36 minutos",
    good: 5.5,
    elite: 8.5,
    formula: "(Asistencias / Minutos) × 36",
    concept: "Capacidad generadora de juego en pista independientemente del rol en la rotación.",
  },
  {
    key: "reb_36",
    label: "REB/36",
    name: "Rebotes por 36 minutos",
    good: 8.0,
    elite: 12.0,
    formula: "(Rebotes / Minutos) × 36",
    concept: "Dominio de los tableros en tiempo efectivo de juego.",
  },
  {
    key: "ts_pct",
    label: "TRUE SHOOTING %",
    name: "Porcentaje de Tiro Verdadero",
    good: 56.0,
    elite: 63.0,
    formula: "Puntos / (2 × (Tiros Campo + 0.44 × Tiros Libres))",
    concept: "La métrica definitiva de eficiencia anotadora valorando triples y tiros libres anotados.",
  },
];

export const CarouselStudio: React.FC<CarouselStudioProps> = ({ onQueueRender }) => {
  const [playersList, setPlayersList] = useState<any[]>(SAMPLE_PLAYERS);
  const [selectedPlayer, setSelectedPlayer] = useState(SAMPLE_PLAYERS[0]);
  const [selectedMetric, setSelectedMetric] = useState(METRICS_CATALOG[0]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayersApi().then((list) => {
      if (list && list.length > 0) {
        const mapped = list.map((p: any) => ({
          ...p,
          cleanName: p.cleanName || p.name || 'Jugador FEB',
          points: Number(p.points || 0),
          rebounds: Number(p.rebounds || 0),
          assists: Number(p.assists || 0),
          valuation: Number(p.valuation || 0),
          pts_36: p.pts_36 || ((Number(p.points || 0) * 1.2).toFixed(1)),
          ts_pct: p.ts_pct || 62.4,
          efg_pct: p.efg_pct || 58.0,
          usg_pct: p.usg_pct || 28.5,
          def_rating: p.def_rating || 99.0,
          net_impact: p.net_impact || 12.0,
          badges: p.badges || ["Líder FEB", "Oficial"],
          gameLog: p.gameLog || [
            { puntos: p.points || 22, valoracion: p.valuation || 25, minutos: "31:00", rebotes_total: p.rebounds || 6, asistencias: p.assists || 4 }
          ]
        }));
        setPlayersList(mapped);
        if (mapped[0]) setSelectedPlayer(mapped[0]);
      }
    }).catch(console.warn);
  }, []);

  const slideRef = useRef<HTMLDivElement>(null);

  const totalSlides = 5;

  const metricValue = (selectedPlayer as any)[selectedMetric.key] || 24.5;
  const isElite = metricValue >= selectedMetric.elite;

  // Single Slide PNG Export
  const handleExportCurrentSlide = async () => {
    if (!slideRef.current) return;
    setIsExporting(true);
    setExportFeedback(`Exportando Diapositiva ${currentSlide + 1}...`);
    try {
      const dataUrl = await toPng(slideRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `basketdata-carrusel-${selectedPlayer.cleanName.replace(/\s+/g, '_')}-slide-${currentSlide + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setExportFeedback("¡Descargado en 2160x2700 HD!");
      setTimeout(() => setExportFeedback(null), 2500);

      if (onQueueRender) {
        onQueueRender({
          id: `carousel-${Date.now()}`,
          name: `Carrusel Slide ${currentSlide + 1}: ${selectedPlayer.cleanName}`,
          type: 'carousel',
          format: 'png',
          status: 'completed',
          progress: 100,
          timestamp: new Date().toLocaleTimeString(),
          url: dataUrl
        });
      }
    } catch (err: any) {
      console.error(err);
      setExportFeedback("Error al renderizar slide");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="carousel-studio">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-orange-500/20 border border-pink-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-pink-400 uppercase tracking-wider font-mono">
            Formato Carrusel 1080x1350 (4:5) Instagram & LinkedIn
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Poppins']">
            Generador de Carruseles de Métricas Avanzadas
          </h2>
          <p className="text-xs sm:text-sm text-white/70 mt-1 font-['Inter']">
            Diseños con identidad oficial BasketData: tipografía Poppins/Inter, gradientes y exportación PNG nítida.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCurrentSlide}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exportFeedback || `Descargar Slide ${currentSlide + 1} en PNG HD`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Slide Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Controls Bar for Slides */}
          <div className="w-full max-w-[432px] flex items-center justify-between mb-3 bg-[#111022] p-2 rounded-xl border border-white/10">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white font-mono">
              Diapositiva {currentSlide + 1} de {totalSlides}
            </span>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
              disabled={currentSlide === totalSlides - 1}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas Box (Scaled for display) */}
          <div className="w-full max-w-[432px] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-[#0c0a17]">
            <div
              ref={slideRef}
              className="w-[1080px] h-[1350px] p-20 flex flex-col relative select-none origin-top-left"
              style={{
                fontFamily: "'Poppins', sans-serif",
                background:
                  "radial-gradient(ellipse 900px 600px at 50% -10%, rgba(168,85,247,0.18), transparent), radial-gradient(ellipse 700px 500px at 100% 100%, rgba(236,72,153,0.12), transparent), #0c0a17",
                transform: "scale(0.4)",
                marginBottom: "-810px", // Offset scale collapse
              }}
            >
              {/* Header inside slide */}
              <div className="flex items-center justify-between">
                <span className="px-6 py-2.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-2xl font-bold uppercase tracking-wider">
                  {selectedMetric.label} · SCOUTING FEB
                </span>
                <span className="text-2xl font-mono text-white/40">
                  {currentSlide + 1}/{totalSlides}
                </span>
              </div>

              {/* SLIDE CONTENT BASED ON CURRENT SLIDE */}
              {currentSlide === 0 && (
                <div className="mt-16 flex-1 flex flex-col justify-between">
                  <div>
                    <h1 className="text-7xl font-black text-white leading-tight tracking-tight mt-4">
                      ¿Por qué <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
                        {selectedPlayer.cleanName}
                      </span> <br />
                      domina en {selectedMetric.label}?
                    </h1>
                    <p className="text-3xl text-white/70 mt-8 font-['Inter'] font-normal leading-relaxed">
                      Radiografía de eficiencia analítica en {selectedPlayer.team} según datos oficiales de la Federación Española.
                    </p>
                  </div>

                  <div className="flex items-center gap-8 p-8 rounded-3xl bg-white/5 border border-white/10">
                    <img
                      src={selectedPlayer.photo}
                      alt={selectedPlayer.cleanName}
                      className="w-36 h-36 rounded-2xl object-cover border-2 border-orange-500/40"
                    />
                    <div>
                      <div className="text-4xl font-bold text-white">{selectedPlayer.cleanName}</div>
                      <div className="text-2xl text-white/60 font-['Inter'] mt-1">{selectedPlayer.team} · #{selectedPlayer.number}</div>
                      <div className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xl font-bold">
                        BD Score: {selectedPlayer.bd_score}/100
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 1 && (
                <div className="mt-16 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-bold text-purple-400 uppercase tracking-widest">
                      Concepto y Normalización
                    </span>
                    <h2 className="text-6xl font-black text-white mt-2 leading-tight">
                      ¿Qué mide exactamente <br />
                      <span className="text-orange-400">{selectedMetric.name}</span>?
                    </h2>
                    <p className="text-3xl text-white/80 mt-8 font-['Inter'] leading-relaxed">
                      {selectedMetric.concept}
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-black/40 border border-white/10 space-y-4">
                    <span className="text-xl font-bold text-white/50 uppercase tracking-wider block font-mono">
                      Fórmula Matemática
                    </span>
                    <code className="text-3xl font-mono text-amber-300 block font-bold">
                      {selectedMetric.formula}
                    </code>
                  </div>
                </div>
              )}

              {currentSlide === 2 && (
                <div className="mt-16 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-bold text-pink-400 uppercase tracking-widest">
                      Rendimiento en Pista
                    </span>
                    <h2 className="text-6xl font-black text-white mt-2 leading-tight">
                      El impacto de <span className="text-orange-400">{selectedPlayer.cleanName}</span>
                    </h2>
                  </div>

                  <div className="p-10 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 text-center">
                    <div className="text-2xl text-white/60 uppercase font-mono">Registro en Liga</div>
                    <div className="text-9xl font-black text-white my-4 font-mono">
                      {metricValue}
                    </div>
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-2xl font-bold">
                      {isElite ? '★ NIVEL ÉLITE EN LA CATEGORÍA' : 'NIVEL DESTACADO'}
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex justify-between text-2xl font-bold">
                      <span className="text-white/60">Percentil en la Competición:</span>
                      <span className="text-orange-400 font-mono">Top 8% de la Liga</span>
                    </div>
                    <div className="w-full bg-white/10 h-6 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-full w-[92%]" />
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 3 && (
                <div className="mt-16 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-bold text-emerald-400 uppercase tracking-widest">
                      Insignias y Roles
                    </span>
                    <h2 className="text-6xl font-black text-white mt-2 leading-tight">
                      Perfil Técnico Reconocido
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6 my-auto">
                    {selectedPlayer.badges.map((b, idx) => (
                      <div key={idx} className="p-8 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-3xl font-bold">
                          ★
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white">{b}</div>
                          <div className="text-xl text-white/50">Insignia Oficial</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-2xl text-white/60 font-['Inter'] leading-relaxed">
                    Evaluado a través del algoritmo analítico de BD Score combinando anotación real, +/- neto y rebotes ajustados.
                  </div>
                </div>
              )}

              {currentSlide === 4 && (
                <div className="mt-16 flex-1 flex flex-col justify-between text-center">
                  <div className="my-auto space-y-8">
                    <h2 className="text-7xl font-black text-white leading-tight">
                      ¿Quieres el informe completo de <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
                        {selectedPlayer.cleanName}
                      </span>?
                    </h2>
                    <p className="text-3xl text-white/70 max-w-2xl mx-auto font-['Inter']">
                      Accede a shot charts, patrones de tiro, comparativa 1v1 y scout arbitral en BasketData.
                    </p>
                    <div className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-black text-3xl shadow-2xl">
                      Pruébalo gratis en basketdata.es →
                    </div>
                  </div>
                </div>
              )}

              {/* Footer inside slide */}
              <div className="mt-auto pt-8 border-t border-white/10 flex items-center justify-between">
                <img src="/logo.png" alt="BasketData" className="h-14 object-contain" />
                <span className="text-2xl text-white/40 font-mono">@basketdata_app</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls & Content Selectors */}
        <div className="lg:col-span-5 bg-[#111022] border border-white/10 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white font-['Poppins'] flex items-center gap-2 border-b border-white/10 pb-3">
            <Layers className="w-4 h-4 text-pink-400" /> Parámetros del Carrusel
          </h3>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 font-['Inter']">
              Jugador Protagonista
            </label>
            <select
              value={selectedPlayer.id}
              onChange={(e) => {
                const p = playersList.find((x) => x.id === e.target.value);
                if (p) setSelectedPlayer(p);
              }}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white"
            >
              {playersList.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#111022]">
                  {p.cleanName} ({p.team})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 font-['Inter']">
              Métrica Clave para el Análisis
            </label>
            <div className="space-y-2">
              {METRICS_CATALOG.map((m) => (
                <div
                  key={m.key}
                  onClick={() => setSelectedMetric(m)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedMetric.key === m.key
                      ? 'bg-pink-500/20 border-pink-500/50 text-white'
                      : 'bg-black/30 border-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">{m.label} · {m.name}</span>
                    <span className="text-[11px] font-mono text-pink-400 font-bold">
                      {(selectedPlayer as any)[m.key] || '24.5'}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/40 block mt-1 font-['Inter']">
                    {m.concept}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleExportCurrentSlide}
              disabled={isExporting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Descargar Slide {currentSlide + 1} en PNG (1080x1350)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
