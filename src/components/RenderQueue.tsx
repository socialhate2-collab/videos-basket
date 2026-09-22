import React from 'react';
import { 
  Film, 
  Download, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  AlertCircle,
  Video,
  Images,
  Trophy
} from 'lucide-react';
import { RenderJob } from '../types/bdata';

interface RenderQueueProps {
  jobs: RenderJob[];
  onClear: () => void;
  onRemoveJob: (id: string) => void;
}

export const RenderQueue: React.FC<RenderQueueProps> = ({ jobs, onClear, onRemoveJob }) => {
  const getIcon = (type: RenderJob['type']) => {
    switch (type) {
      case 'video_match':
      case 'video_player':
        return <Video className="w-4 h-4 text-orange-400" />;
      case 'ranking':
      case 'battle':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'carousel':
        return <Images className="w-4 h-4 text-pink-400" />;
      default:
        return <Film className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="render-queue">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111022] p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white font-['Poppins'] flex items-center gap-2">
            <Film className="w-5 h-5 text-orange-400" /> Cola y Registro de Renders
          </h2>
          <p className="text-xs text-white/60 mt-1 font-['Inter']">
            Historial de vídeos generados en Remotion y carruseles descargados durante tu sesión de trabajo.
          </p>
        </div>

        {jobs.length > 0 && (
          <button
            onClick={onClear}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/70 hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" /> Limpiar Registro
          </button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#111022] border border-white/10 space-y-3">
          <Film className="w-10 h-10 text-white/20 mx-auto" />
          <h3 className="text-sm font-bold text-white">No hay renders recientes en la cola</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Ve a las secciones de <strong>Remotion Studio</strong>, <strong>Vídeo Jugador</strong> o <strong>Carruseles</strong> y pulsa en "Renderizar" para ver tus trabajos completados aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-xl bg-[#111022] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
                  {getIcon(job.type)}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    {job.name}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-white/70">
                      {job.format}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" /> {job.timestamp}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completado
                </div>

                {job.url && (
                  <a
                    href={job.url}
                    download={`basketdata-${job.type}-${job.id}.${job.format}`}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Descargar archivo"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={() => onRemoveJob(job.id)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                  title="Eliminar de la lista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
