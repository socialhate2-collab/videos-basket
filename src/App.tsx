import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Film, 
  Images, 
  MessageSquareText, 
  Layers, 
  Server, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Flame,
  Zap,
  Activity
} from 'lucide-react';
import { RemotionStudio } from './components/RemotionStudio';
import { PlayerVideoStudio } from './components/PlayerVideoStudio';
import { CarouselStudio } from './components/CarouselStudio';
import { SocialCopysStudio } from './components/SocialCopysStudio';
import { RenderQueue } from './components/RenderQueue';
import { ArchitectureAnalysis } from './components/ArchitectureAnalysis';
import { RailwayConnectionModal } from './components/RailwayConnectionModal';
import { RenderJob } from './types/bdata';
import { checkBackendHealth, getUseLiveBackend } from './services/basketDataApi';

export default function App() {
  const [activeTab, setActiveTab] = useState<'remotion' | 'player_video' | 'carousel' | 'copys' | 'queue' | 'analysis'>('remotion');
  const [isRailwayModalOpen, setIsRailwayModalOpen] = useState(false);
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>(() => {
    try {
      const saved = localStorage.getItem('bd_render_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendStatus(res.ok);
    });
  }, []);

  const refreshStatus = () => {
    checkBackendHealth().then((res) => {
      setBackendStatus(res.ok);
    });
  };

  const handleQueueRender = (job: RenderJob) => {
    setRenderJobs((prev) => {
      const updated = [job, ...prev];
      localStorage.setItem('bd_render_jobs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearJobs = () => {
    setRenderJobs([]);
    localStorage.removeItem('bd_render_jobs');
  };

  const handleRemoveJob = (id: string) => {
    setRenderJobs((prev) => {
      const updated = prev.filter((j) => j.id !== id);
      localStorage.setItem('bd_render_jobs', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#0c0a17] text-white flex flex-col font-['Inter'] selection:bg-orange-500 selection:text-white">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-50 bg-[#111022]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="BasketData Logo" 
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  // Fallback icon if logo image is missing
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Poppins'] font-black text-lg tracking-tight bg-gradient-to-r from-white via-white to-orange-400 bg-clip-text text-transparent">
                  BASKETDATA
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Studio /bdata
                </span>
              </div>
              <span className="text-[11px] text-white/50 block font-['Inter']">
                Generador y Renderizador de Contenido Automatizado
              </span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRailwayModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                backendStatus
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Haz clic para comprobar y configurar la URL de tu backend en Railway"
            >
              <div className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{backendStatus ? 'Railway Backend Online' : '⚠️ Conectar Railway'}</span>
            </button>

            {renderJobs.length > 0 && (
              <button
                onClick={() => setActiveTab('queue')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold font-mono hover:bg-orange-500/30 transition-all"
              >
                <Film className="w-3.5 h-3.5" />
                <span>{renderJobs.length} Renders</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'remotion', label: 'Remotion Studio', icon: Video },
            { id: 'player_video', label: 'Vídeo Jugador 9:16', icon: Flame },
            { id: 'carousel', label: 'Carruseles Instagram', icon: Images },
            { id: 'copys', label: 'Copys Redes', icon: MessageSquareText },
            { id: 'queue', label: `Cola Renders (${renderJobs.length})`, icon: Film },
            { id: 'analysis', label: 'Auditoría Arquitectura', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'remotion' && (
          <RemotionStudio 
            onQueueRender={handleQueueRender} 
            onOpenRailwayModal={() => setIsRailwayModalOpen(true)}
          />
        )}

        {activeTab === 'player_video' && (
          <PlayerVideoStudio onQueueRender={handleQueueRender} />
        )}

        {activeTab === 'carousel' && (
          <CarouselStudio onQueueRender={handleQueueRender} />
        )}

        {activeTab === 'copys' && (
          <SocialCopysStudio />
        )}

        {activeTab === 'queue' && (
          <RenderQueue 
            jobs={renderJobs} 
            onClear={handleClearJobs} 
            onRemoveJob={handleRemoveJob} 
          />
        )}

        {activeTab === 'analysis' && (
          <ArchitectureAnalysis />
        )}
      </main>

      {/* Railway Connection Modal */}
      <RailwayConnectionModal
        isOpen={isRailwayModalOpen}
        onClose={() => setIsRailwayModalOpen(false)}
        onConnectionSuccess={refreshStatus}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-4 sm:px-8 text-center text-xs text-white/40 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>BasketData Studio · Motor de renderizado automatizado</span>
          <span className="text-[11px] text-white/30">
            Remotion v4 + React 19 + Vite + Canvas Confetti · Diseñado para Vercel & Railway
          </span>
        </div>
      </footer>
    </div>
  );
}
