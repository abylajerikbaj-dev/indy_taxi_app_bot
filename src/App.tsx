import { TonConnectButton } from '@tonconnect/ui-react';
import { useState, useEffect, useRef } from 'react';

function App() {
  const [lang, setLang] = useState<'kk' | 'ru'>('kk');
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [pickup, setPickup] = useState("Алматы орталығы");
  const [destination, setDestination] = useState("Медеу ауданы");
  const [priceOffer, setPriceOffer] = useState(1800);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const mapRef = useRef<any>(null);

  const texts = {
    kk: { title: "Indy Taxi TON", passenger: "👤 Жолаушы", driver: "🚕 Таксист", call: "🚕 Такси шақыру" },
    ru: { title: "Indy Taxi TON", passenger: "👤 Пассажир", driver: "🚕 Водитель", call: "🚕 Вызвать такси" }
  };
  const t = texts[lang];

  // Leaflet картасы (толық экран, Uber сияқты)
  useEffect(() => {
    if (role !== 'passenger' || typeof window === 'undefined' || !window.L) return;

    const map = window.L.map('map', { zoomControl: false }).setView([43.2567, 76.9286], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    window.L.marker([43.2567, 76.9286]).addTo(map).bindPopup("📍 Қайдан аламыз?");
    window.L.marker([43.2383, 76.8894]).addTo(map).bindPopup("📍 Қайда барамыз?");

    mapRef.current = map;

    return () => map.remove();
  }, [role]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, { from: 'me', text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative font-sans">
      {/* Modern Header + TON Wallet */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl p-5 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">🚖</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Indy Taxi TON</h1>
            <p className="text-xs text-emerald-400">СНГ-дің №1 TON таксиі</p>
          </div>
        </div>
        <TonConnectButton />
      </div>

      {/* Рөл таңдау (неонды стиль) */}
      <div className="absolute top-24 left-4 right-4 z-50 bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-1 flex shadow-2xl border border-zinc-700">
        <button 
          onClick={() => setRole('passenger')} 
          className={`flex-1 py-5 rounded-3xl font-bold text-lg transition-all ${role === 'passenger' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg' : 'text-gray-400'}`}
        >
          👤 Жолаушы
        </button>
        <button 
          onClick={() => setRole('driver')} 
          className={`flex-1 py-5 rounded-3xl font-bold text-lg transition-all ${role === 'driver' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg' : 'text-gray-400'}`}
        >
          🚕 Таксист
        </button>
      </div>

      {/* Жолаушы — толық экран картасы */}
      {role === 'passenger' && (
        <>
          <div id="map" className="absolute inset-0 z-0" />

          {/* Адрес өрістері (заманауи карточка) */}
          <div className="absolute top-40 left-4 right-4 z-50 bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-zinc-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex-shrink-0" />
              <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} className="flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-gray-500" placeholder="Қайдан аламыз?" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0" />
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-gray-500" placeholder="Қайда барамыз?" />
            </div>
          </div>

          {/* Баға келісу карточкасы */}
          <div className="absolute top-[290px] left-4 right-4 z-50 bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-zinc-700">
            <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">💰 Баға келісу</h3>
            <input type="number" value={priceOffer} onChange={(e) => setPriceOffer(Number(e.target.value))} className="w-full bg-zinc-800 p-5 rounded-2xl text-4xl text-center font-bold outline-none" />
          </div>

          {/* Үлкен шақыру батырмасы */}
          <div className="absolute bottom-8 left-4 right-4 z-50">
            <button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 py-7 rounded-3xl text-2xl font-bold shadow-2xl active:scale-95 transition-all">
              🚕 Такси шақыру
            </button>
          </div>

          {/* Чат (төменгі қалқымалы) */}
          <div className="absolute bottom-28 left-4 right-4 z-50 bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-zinc-700">
            <h3 className="font-semibold mb-3">💬 Чат</h3>
            <div className="h-40 overflow-y-auto mb-4 bg-zinc-800 p-4 rounded-2xl space-y-3 text-sm">
              {messages.map((m, i) => <p key={i} className="text-right text-cyan-400">{m.text}</p>)}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} className="flex-1 bg-zinc-800 p-4 rounded-3xl text-sm outline-none" placeholder="Хабарлама жазыңыз..." />
              <button onClick={sendMessage} className="bg-blue-600 px-8 rounded-3xl font-medium">Жіберу</button>
            </div>
          </div>
        </>
      )}

      {/* Таксист режимі */}
      {role === 'driver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6">🚕 Жаңа заказ күтілуде...</h2>
            <p className="text-emerald-400 text-xl">Алматыда 18 такси онлайн</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
