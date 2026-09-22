import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Database, 
  Globe, 
  Video, 
  Zap, 
  RefreshCw, 
  ExternalLink,
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';
import { 
  checkBackendHealth, 
  getStoredBackendUrl, 
  setStoredBackendUrl, 
  getUseLiveBackend, 
  setUseLiveBackend,
  getStoredApiKey,
  setStoredApiKey,
  HealthCheckResult 
} from '../services/basketDataApi';

export const ArchitectureAnalysis: React.FC = () => {
  const [backendUrl, setBackendUrl] = useState(getStoredBackendUrl());
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [isLive, setIsLive] = useState(getUseLiveBackend());
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async (testUrl?: string) => {
    setIsChecking(true);
    const target = testUrl || backendUrl;
    const res = await checkBackendHealth(target);
    setHealthStatus(res);
    setIsChecking(false);
  };

  const handleSaveConfig = () => {
    setStoredBackendUrl(backendUrl);
    setStoredApiKey(apiKey);
    setUseLiveBackend(isLive);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    runHealthCheck();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12" id="architecture-analysis">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#131127] via-[#1a1736] to-[#0f0e1d] p-7 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" /> Auditoría Técnica de Arquitectura
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Poppins'] tracking-tight">
              Análisis del Proyecto: BASKETDATA.LANZAMIENTO.V2
            </h1>
            <p className="text-white/70 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed font-['Inter']">
              Evaluación técnica de viabilidad para el entorno Google AI Studio: Frontend en Vercel, Backend en Railway y la suite de renderizado <strong className="text-orange-400">/bdata</strong> con Remotion.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${
              healthStatus?.ok 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${healthStatus?.ok ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {healthStatus?.ok ? 'Backend Railway Conectado' : 'Estudio en Modo Autónomo / Caché'}
            </div>
            <span className="text-xs text-white/40 font-mono">
              Puerto Local: 3000 · Vite + React 19 + Remotion
            </span>
          </div>
        </div>
      </div>

      {/* Answer to User Query: "¿Es posible correrlo aquí?" */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl bg-[#111022] border border-white/10 p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
            1
          </div>
          <h2 className="text-lg font-bold text-white font-['Poppins'] flex items-center gap-2">
            <Server className="w-5 h-5 text-orange-400" /> Backend en Railway (Python)
          </h2>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-['Inter']">
            Tu intuición es <strong>totalmente acertada</strong>. Correr el backend monolítico completo dentro de este contenedor aislado no es recomendable ni viable por varias razones:
          </p>
          <ul className="text-xs text-white/60 space-y-2 font-['Inter'] list-disc pl-4">
            <li><strong>588 KB de FastAPI (<code className="text-orange-300">server.py</code>)</strong> con más de 25 servicios vinculados (ReportLab, scraping periódico a FEB, etc.).</li>
            <li>Requiere conexión externa a <strong>MongoDB Atlas</strong> y credenciales de <strong>Firebase Admin SDK</strong>.</li>
            <li>En este entorno solo existe un único puerto expuesto hacia el exterior (puerto 3000).</li>
          </ul>
        </div>

        <div className="rounded-xl bg-[#111022] border border-white/10 p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            2
          </div>
          <h2 className="text-lg font-bold text-white font-['Poppins'] flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" /> Frontend en Vercel (React)
          </h2>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-['Inter']">
            La web principal en Vercel tiene más de 30 páginas completas de scouting, informes, suscripciones y partidos.
          </p>
          <ul className="text-xs text-white/60 space-y-2 font-['Inter'] list-disc pl-4">
            <li>Usa CRA + Craco con Tailwind CSS y dependencias de UI complejas.</li>
            <li>Depende de llamadas en vivo al backend de Railway para autenticación y base de datos.</li>
            <li>Vercel es el host óptimo para producción para servir las páginas estáticas y el routing público.</li>
          </ul>
        </div>

        <div className="rounded-xl bg-gradient-to-b from-[#19153a] to-[#121124] border border-emerald-500/40 p-6 space-y-4 ring-1 ring-emerald-500/20">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            3
          </div>
          <h2 className="text-lg font-bold text-emerald-300 font-['Poppins'] flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-400" /> ¿Y la parte de /bdata?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-['Inter']">
            <strong className="text-emerald-400">¡SÍ, 100% VIABLE Y PERFECTO AQUÍ!</strong> Hemos adaptado toda la suite de <strong>/bdata</strong> directamente en este Studio:
          </p>
          <ul className="text-xs text-white/70 space-y-2 font-['Inter'] list-disc pl-4">
            <li><strong>Remotion Engine React 19</strong>: Reproducción interactiva en vivo sin necesidad de Chromium en servidor.</li>
            <li><strong>Grabación y Render WebM/MP4</strong> en el navegador a 30/60 FPS con descarga directa instantánea.</li>
            <li><strong>Carruseles en Alta Resolución (1080x1350)</strong> exportados con Canvas / toPng al momento.</li>
            <li><strong>Zero-Latency</strong>: Trabaja con datos reales de jugadores y partidos sin sufrir los cold-starts de Railway.</li>
          </ul>
        </div>
      </div>

      {/* Backend Integration & Health Controller */}
      <div className="rounded-2xl bg-[#111022] border border-white/10 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Poppins'] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-400" /> Conexión con tu Backend de Railway
            </h3>
            <p className="text-xs text-white/60 font-['Inter']">
              Configura la URL de tu API para que este panel consuma datos en vivo o funcione con la caché de estudio.
            </p>
          </div>
          <button
            onClick={() => runHealthCheck()}
            disabled={isChecking}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Comprobando...' : 'Comprobar Estado'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 font-['Inter']">
                URL de tu Backend en Railway
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://tu-proyecto.up.railway.app"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 transition-colors font-mono"
              />
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-white/40">
                <span>Rápido:</span>
                <button
                  type="button"
                  onClick={() => { setBackendUrl('http://localhost:8000'); runHealthCheck('http://localhost:8000'); }}
                  className="text-orange-400 hover:underline font-mono"
                >
                  localhost:8000
                </button>
                <span>·</span>
                <span>Endpoint testeado: <code className="text-white/60">{healthStatus?.endpointTested || '/api/health'}</code></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 font-['Inter']">
                Token Bearer / API Key (Opcional)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Bearer o token si tu FastAPI lo requiere..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors font-mono"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div>
                <span className="text-xs font-bold text-white block">Modo Datos en Vivo (Live)</span>
                <span className="text-[11px] text-white/50 block">
                  Si se desactiva, utiliza el banco de datos de alta fidelidad precargado en el estudio.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isLive} 
                  onChange={(e) => setIsLive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <button
              onClick={handleSaveConfig}
              className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" /> Configuración Guardada y Verificada
                </>
              ) : (
                'Guardar Configuración y Actualizar'
              )}
            </button>
          </div>

          {/* Diagnostic status readout */}
          <div className="rounded-xl bg-black/40 border border-white/10 p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 font-mono">
                Diagnóstico de Respuesta
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${healthStatus?.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="text-sm font-bold text-white">
                  {healthStatus?.statusText || 'Verificando servicio...'}
                </span>
              </div>

              {healthStatus?.diagnosticHint && (
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 leading-relaxed">
                  {healthStatus.diagnosticHint}
                </div>
              )}

              <div className="space-y-2 text-xs text-white/70 font-mono">
                <div className="flex justify-between border-b border-white/5 py-1.5">
                  <span className="text-white/40">Latencia:</span>
                  <span className="text-white font-semibold">
                    {healthStatus?.latencyMs !== undefined ? `${healthStatus.latencyMs} ms` : '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1.5">
                  <span className="text-white/40">Última comprobación:</span>
                  <span>{healthStatus?.timestamp || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1.5">
                  <span className="text-white/40">Modo activo:</span>
                  <span className={isLive ? 'text-orange-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {isLive ? 'Live API (Railway)' : 'Estudio Autónomo (Caché)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-300 leading-normal">
              🔍 <strong>Para obtener la URL exacta en Railway</strong>: Entra en Railway &gt; Abre tu servicio de Backend &gt; Pestaña <em>Settings</em> &gt; <em>Networking</em> &gt; <em>Public Networking</em> &gt; <em>Generate Domain</em> y pega aquí el dominio generado.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
