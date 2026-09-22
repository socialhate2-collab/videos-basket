import React, { useState, useEffect } from 'react';
import { 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  HelpCircle, 
  FileJson, 
  Upload, 
  Zap, 
  Globe, 
  ShieldCheck,
  ChevronRight,
  Database
} from 'lucide-react';
import { 
  checkBackendHealth, 
  getStoredBackendUrl, 
  setStoredBackendUrl, 
  getUseLiveBackend, 
  setUseLiveBackend,
  getStoredApiKey,
  setStoredApiKey,
  getStoredCustomData,
  setStoredCustomData,
  HealthCheckResult 
} from '../services/basketDataApi';

interface RailwayConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSuccess?: () => void;
}

export const RailwayConnectionModal: React.FC<RailwayConnectionModalProps> = ({ 
  isOpen, 
  onClose,
  onConnectionSuccess 
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'guide' | 'json'>('url');
  const [url, setUrl] = useState(getStoredBackendUrl());
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [isLive, setIsLive] = useState(getUseLiveBackend());
  const [isChecking, setIsChecking] = useState(false);
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccess, setJsonSuccess] = useState<string | null>(null);
  const [hasCustomData, setHasCustomData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl(getStoredBackendUrl());
      setApiKey(getStoredApiKey());
      setIsLive(getUseLiveBackend());
      const custom = getStoredCustomData();
      setHasCustomData(!!custom);
      handleCheck(getStoredBackendUrl());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheck = async (targetUrl?: string) => {
    setIsChecking(true);
    const testUrl = targetUrl || url;
    const res = await checkBackendHealth(testUrl);
    setHealth(res);
    setIsChecking(false);
  };

  const handleSaveAndApply = async () => {
    setStoredBackendUrl(url);
    setStoredApiKey(apiKey);
    setUseLiveBackend(isLive);

    // Test again
    setIsChecking(true);
    const res = await checkBackendHealth(url);
    setHealth(res);
    setIsChecking(false);

    if (res.ok) {
      if (onConnectionSuccess) onConnectionSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const processJsonData = (rawText: string) => {
    setJsonError(null);
    setJsonSuccess(null);
    try {
      if (!rawText.trim()) {
        setJsonError('El contenido JSON está vacío.');
        return;
      }
      let parsed = JSON.parse(rawText);

      // Handle wrapper objects like { super_cache: ... }, { cache: ... }, { data: ... }, { snapshot: ... }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (parsed.super_cache) parsed = parsed.super_cache;
        else if (parsed.supercache) parsed = parsed.supercache;
        else if (parsed.cache) parsed = parsed.cache;
        else if (parsed.feb_cache) parsed = parsed.feb_cache;
        else if (parsed.snapshot) parsed = parsed.snapshot;
        else if (parsed.data && typeof parsed.data === 'object') parsed = parsed.data;
      }

      let matches = [];
      let players = [];
      let topPlayers = undefined;

      if (Array.isArray(parsed)) {
        // Check if elements look like matches or players
        if (parsed[0] && ('home_team' in parsed[0] || 'marcador_local' in parsed[0] || 'local' in parsed[0])) {
          matches = parsed;
        } else {
          players = parsed;
        }
      } else if (typeof parsed === 'object' && parsed !== null) {
        matches = parsed.matches || parsed.partidos || parsed.games || [];
        players = parsed.players || parsed.jugadores || [];
        topPlayers = parsed.top_players || parsed.rankings || undefined;
      }

      if (matches.length === 0 && players.length === 0 && !topPlayers) {
        setJsonError('No se encontraron partidos, jugadores ni rankings reconocibles en el archivo o texto JSON.');
        return;
      }

      setStoredCustomData({
        matches: matches.length > 0 ? matches : undefined,
        players: players.length > 0 ? players : undefined,
        top_players: topPlayers,
        timestamp: new Date().toLocaleString()
      });

      setHasCustomData(true);
      setJsonSuccess(`¡Éxito! Importados ${matches.length} partidos, ${players.length} jugadores${topPlayers ? ' y rankings' : ''}.`);
      if (onConnectionSuccess) onConnectionSuccess();
    } catch (e: any) {
      setJsonError(`Error de sintaxis JSON: ${e.message}`);
    }
  };

  const handleImportJson = () => {
    processJsonData(jsonInput);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonInput(content);
        processJsonData(content);
      }
    };
    reader.readAsText(file);
  };

  const handleClearCustomData = () => {
    setStoredCustomData(null);
    setHasCustomData(false);
    setJsonInput('');
    setJsonSuccess('Datos personalizados eliminados. Volviendo a la fuente principal.');
    if (onConnectionSuccess) onConnectionSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111022] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Poppins'] font-bold text-white text-base sm:text-lg flex items-center gap-2">
                Conexión con Railway Backend
              </h2>
              <p className="text-xs text-white/50 font-['Inter']">
                Configura la URL de tu FastAPI o importa datos de la FEB para los renders
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 px-6 bg-black/40">
          <button
            onClick={() => setActiveTab('url')}
            className={`py-3 px-4 text-xs font-bold font-['Poppins'] border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'url'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> URL & Diagnóstico
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-bold font-['Poppins'] border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> ¿Cómo obtener mi URL en Railway?
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-4 text-xs font-bold font-['Poppins'] border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'json'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" /> Importar JSON FEB {hasCustomData && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-5 font-['Inter'] flex-1">
          {activeTab === 'url' && (
            <div className="space-y-5">
              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                  URL del Servicio de Railway
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://tu-backend.up.railway.app"
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 font-mono transition-colors"
                  />
                  <button
                    onClick={() => handleCheck()}
                    disabled={isChecking}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                    {isChecking ? 'Probando...' : 'Test'}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-white/40">
                  <span>Sugerencias rápidas:</span>
                  <button 
                    onClick={() => { setUrl("http://localhost:8000"); handleCheck("http://localhost:8000"); }}
                    className="text-orange-400 hover:underline font-mono"
                  >
                    localhost:8000
                  </button>
                  <span>·</span>
                  <button 
                    onClick={() => setActiveTab('guide')}
                    className="text-white/60 hover:text-white hover:underline"
                  >
                    Ver cómo encontrarla en Railway →
                  </button>
                </div>
              </div>

              {/* API Key / Token Optional */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  API Key o Token Bearer (Opcional si tu FastAPI tiene autenticación)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Bearer bd_secret_token_123..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono transition-colors"
                />
              </div>

              {/* Toggle Live Mode */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Activar Modo Datos en Vivo (Live API)</span>
                  <span className="text-[11px] text-white/50 block">
                    Al activar, los partidos y jugadores se obtendrán directamente de tu backend en Railway.
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

              {/* Live Diagnosis Card */}
              <div className={`p-4 rounded-xl border ${
                health?.ok 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : health?.errorReason === 'app_not_found'
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  {health?.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {health ? health.statusText : 'Comprobando conexión...'}
                      </span>
                      {health?.latencyMs !== undefined && (
                        <span className="text-[11px] font-mono text-white/50">
                          {health.latencyMs} ms
                        </span>
                      )}
                    </div>
                    {health?.diagnosticHint && (
                      <p className="text-xs text-white/70 leading-relaxed">
                        {health.diagnosticHint}
                      </p>
                    )}
                    {health?.errorReason === 'app_not_found' && (
                      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] text-rose-300">
                          Railway no encuentra esa app. Revisa tu panel en Railway.
                        </span>
                        <button
                          onClick={() => setActiveTab('guide')}
                          className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                        >
                          Ver instrucciones <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-white/80 leading-relaxed">
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300">
                💡 <strong>Por qué suele fallar la URL por defecto:</strong> Railway no utiliza dominios fijos globales. Cada despliegue recibe un subdominio único o aleatorio hasta que generas el dominio público en la configuración.
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm">Paso a paso para obtener la URL correcta:</h4>
                <ol className="space-y-2 list-decimal pl-4 text-white/70">
                  <li>
                    Abre tu cuenta de <strong>Railway</strong> en{' '}
                    <a 
                      href="https://railway.com/dashboard" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-orange-400 hover:underline inline-flex items-center gap-1"
                    >
                      railway.com/dashboard <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Entra en el proyecto donde está desplegado tu <strong>FastAPI Backend</strong>.</li>
                  <li>Haz clic sobre el servicio de Python / Backend.</li>
                  <li>Haz clic en la pestaña <strong>Settings</strong> (Configuración).</li>
                  <li>Baja hasta el apartado <strong>Networking</strong> y busca <strong>Public Networking</strong>.</li>
                  <li>
                    Si no hay ningún enlace, haz clic en el botón <strong>"Generate Domain"</strong>.
                  </li>
                  <li>
                    Copia la URL que termina en <code className="text-orange-300">.up.railway.app</code> y pégala en la pestaña <em>"URL & Diagnóstico"</em>.
                  </li>
                </ol>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-white/60">
                <strong>¿Servidor en reposo (Cold Start)?</strong> En el plan gratuito de Railway, los servidores se apagan tras unos minutos de inactividad. La primera llamada puede tardar <strong>15 a 30 segundos</strong> en responder mientras inicia el contenedor.
              </div>

              <button
                onClick={() => setActiveTab('url')}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                Volver a configurar la URL
              </button>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 leading-relaxed">
                🏀 <strong>Foto / Super Caché de la Base de Datos</strong>: Sube tu archivo <code className="text-amber-300 font-bold">.json</code> o pega el texto exportado de Railway / MongoDB / Scraper FEB. El sistema detecta automáticamente si contiene partidos, jugadores o rankings y sincroniza al instante todos los vídeos de Remotion, carruseles y copys.
              </div>

              {/* Botón de subida de archivo directo */}
              <div className="border-2 border-dashed border-white/20 hover:border-orange-500/50 rounded-xl p-4 text-center transition-colors bg-white/[0.02]">
                <input
                  type="file"
                  id="json-file-input"
                  accept=".json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="json-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">
                    Haz clic aquí para seleccionar tu archivo JSON de la base de datos
                  </span>
                  <span className="text-[11px] text-white/50">
                    Soporta volcados de super_cache, MongoDB, FEB scrapers o arrays
                  </span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
                    O pega el contenido JSON directamente
                  </label>
                  {jsonInput && (
                    <button
                      type="button"
                      onClick={() => setJsonInput('')}
                      className="text-[10px] text-white/40 hover:text-white"
                    >
                      Limpiar texto
                    </button>
                  )}
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`Ejemplo de formato super_cache:\n{\n  "matches": [...],\n  "players": [...],\n  "top_players": { "points": [...] }\n}`}
                  className="w-full h-36 bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </div>

              {jsonError && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300">
                  {jsonError}
                </div>
              )}

              {jsonSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300">
                  {jsonSuccess}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleImportJson}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" /> Importar y Usar en Renders
                </button>
                {hasCustomData && (
                  <button
                    onClick={handleClearCustomData}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs font-semibold transition-colors"
                  >
                    Restablecer
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/30 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleSaveAndApply}
            disabled={isChecking}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            {health?.ok ? (
              <>
                <Check className="w-4 h-4" /> Guardar y Aplicar Datos en Vivo
              </>
            ) : (
              'Guardar y Verificar'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
