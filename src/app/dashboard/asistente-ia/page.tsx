"use client";
import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useConfig } from '@/context/ConfigContext';

interface Mensaje {
  id: string;
  tipo: 'usuario' | 'asistente';
  contenido: string;
  timestamp: Date;
}

export default function AsistenteIAPage() {
  const { t, lang } = useConfig();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const respuestasMock = {
    comprar: t('assistantIA', 'respComprar'),
    adquirir: t('assistantIA', 'respAdquirir'),
    mantenimiento: t('assistantIA', 'respMantenimiento'),
    precio: t('assistantIA', 'respPrecio'),
    tarifa: t('assistantIA', 'respTarifa'),
    default: t('assistantIA', 'respDefault'),
  };

  const obtenerRespuesta = (pregunta: string): string => {
    const preguntaLower = pregunta.toLowerCase();
    const reglas = [
      { keys: lang === 'en' ? ['buy', 'purchase'] : ['comprar'], value: respuestasMock.comprar },
      { keys: lang === 'en' ? ['acquire', 'expand'] : ['adquirir'], value: respuestasMock.adquirir },
      { keys: ['mantenimiento', 'maintenance'], value: respuestasMock.mantenimiento },
      { keys: ['precio', 'price', 'pricing'], value: respuestasMock.precio },
      { keys: ['tarifa', 'rate', 'rates'], value: respuestasMock.tarifa },
    ];

    for (const regla of reglas) {
      if (regla.keys.some((keyword) => preguntaLower.includes(keyword))) {
        return regla.value;
      }
    }

    return respuestasMock.default;
  };

  const enviarMensaje = async () => {
    if (!input.trim()) return;

    const mensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: input,
      timestamp: new Date()
    };

    setMensajes([...mensajes, mensajeUsuario]);
    setInput('');
    setLoading(true);

    // Simular delay de IA (mínimo 1.5 segundos)
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const respuesta = obtenerRespuesta(input);
    const mensajeAsistente: Mensaje = {
      id: (Date.now() + 1).toString(),
      tipo: 'asistente',
      contenido: respuesta,
      timestamp: new Date()
    };

    setMensajes(prev => [...prev, mensajeAsistente]);
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black italic uppercase mb-2">🤖 {t('assistantIA', 'title')}</h1>
          <p className="text-gray-500">{t('assistantIA', 'subtitle')}</p>
          <div className="mt-4 inline-block bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2">
            <p className="text-xs text-orange-400 font-bold">⚠️ {t('assistantIA', 'demoMode')}</p>
          </div>
        </div>

        {/* Sugerencias rápidas */}
        {mensajes.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              t('assistantIA', 'quickBuy'),
              t('assistantIA', 'quickMaint'),
              t('assistantIA', 'quickPrices'),
              t('assistantIA', 'quickRates'),
            ].map((sugerencia, i) => (
              <button
                key={i}
                onClick={() => setInput(sugerencia)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-gray-800 rounded-lg text-xs text-gray-400 hover:text-white transition"
              >
                {sugerencia}
              </button>
            ))}
          </div>
        )}

        {/* Chat */}
        <Card className="min-h-[400px] max-h-[500px] overflow-y-auto space-y-4 p-6">
          {mensajes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600">
              <p className="text-center">
                👋 {t('assistantIA', 'emptyHello')}<br/>
                {t('assistantIA', 'emptyHint')}
              </p>
            </div>
          ) : (
            mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    mensaje.tipo === 'usuario'
                      ? 'bg-[#00E5FF] text-black'
                      : 'bg-white/5 text-white border border-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{mensaje.contenido}</p>
                  <p className="text-[9px] mt-2 opacity-50">
                    {mensaje.timestamp.toLocaleTimeString(lang === 'en' ? 'en-US' : 'es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-gray-800 p-4 rounded-2xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
            placeholder={t('assistantIA', 'placeholder')}
            className="flex-1 bg-[#1A1A24] border border-gray-700 rounded-xl p-4 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
            disabled={loading}
          />
          <Button onClick={enviarMensaje} disabled={loading || !input.trim()}>
            {t('assistantIA', 'send')}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
