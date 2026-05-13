import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Varoni Motos coordinates
const POSITION = { lat: -21.2889246, lng: -50.341142 };

export function StoreMap() {
  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-neutral-900 rounded-[3rem] p-8 text-center">
        <div className="max-w-md space-y-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Configuração do Mapa Necessária</h2>
          <div className="space-y-4 text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">
            <p><strong>Passo 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-yellow-400 hover:underline">Obtenha uma Chave de API</a></p>
            <p><strong>Passo 2:</strong> Adicione a chave no AI Studio:</p>
            <ul className="text-left space-y-2 list-none p-0 inline-block">
              <li>• Abra <strong>Settings</strong> (ícone ⚙️ no canto superior direito)</li>
              <li>• Selecione <strong>Secrets</strong></li>
              <li>• Digite <code>GOOGLE_MAPS_PLATFORM_KEY</code>, dê <strong>Enter</strong></li>
              <li>• Cole sua chave, dê <strong>Enter</strong></li>
            </ul>
          </div>
          <p className="text-[10px] text-yellow-400/50 uppercase tracking-[0.2em]">O app irá reconstruir automaticamente após salvar o segredo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={POSITION}
          defaultZoom={16}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={false}
          gestureHandling="greedy"
        >
          <AdvancedMarker position={POSITION}>
             <Pin background="#EAB308" glyphColor="#000" borderColor="#000" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}
