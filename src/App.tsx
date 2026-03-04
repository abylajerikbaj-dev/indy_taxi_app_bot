import { TonConnectButton } from '@tonconnect/ui-react';
import { useState, useEffect, useRef } from 'react';

const cities = {
  Almaty: { name: "Алматы", lat: 43.2567, lng: 76.9286 }
};

function App() {
  const [lang, setLang] = useState<'kk' | 'ru'>('kk');
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [pickup, setPickup] = useState("Алматы орталығы");
  const [destination, setDestination] = useState("Медеу ауданы");

  const mapRef = useRef<any>(null);

  const texts = {
    kk: { title: "Indy Taxi TON", passenger: "👤 Жолаушы", driver: "🚕 Таксист", call: "🚕 Такси шақыру" },
    ru: { title: "Indy Taxi TON", passenger: "👤 Пассажир", driver: "🚕 Водитель", call: "🚕 Вызвать такси" }
  };
  const t = texts[lang];

  // Uber стиліндегі карта (жолаушы таңдағанда бірден толық экран шығады)
  useEffect(() => {
    if (role !== 'passenger' || typeof window === 'undefined' || !window.L) return;

    const map = window.L.map('map', { zoomControl: false }).setView([43.2567, 76.9286], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Pickup маркері
    window.L.marker([43.2567, 76.9286]).addTo(map).bindPopup("Қайдан аламыз?");
    // Destination маркері
    window.L.marker([43.2383, 76.8894]).addTo(map).bindPopup("Қайда барамыз?");

    mapRef.current = map;

    return () => map.remove();
  }, [role]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Top bar — Uber стилі */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center gap-4">
        <div className="flex gap-2">
          <button onClick={() => setLang('kk')} className={`px-5 py-2 rounded-full text-sm font-medium ${lang === 'kk' ? 'bg-white text-black' : 'bg-gray-800'}`}>🇰🇿 Қазақша</button>
          <button onClick={() => setLang('ru')} className={`px-5 py-2 rounded-full text-sm font-medium ${lang === 'ru' ? 'bg-white text-black' : 'bg-gray-800'}`}>🇷🇺 Русский</button>
        </div>
        <TonConnectButton className="ml-auto" />
      </div>

      {/* Рөл таңдау */}
      <div className="absolute top-20 left-4 right-4 z-50 bg-gray-900 rounded-3xl p-1 flex shadow-2xl">
        <button onClick={() => setRole('passenger')} className={`flex-1 py-4 rounded-3xl font-bold text-lg ${role === 'passenger' ? 'bg-blue-600' : 'text-gray-400'}`}>{t.passenger}</button>
        <button onClick={() => setRole('driver')} className={`flex-1 py-4 rounded-3xl font-bold text-lg ${role === 'driver' ? 'bg-blue-600' : 'text-gray-400'}`}>{t.driver}</button>
      </div>

      {/* Жолаушы — Uber стилі (карта толық экран) */}
      {role === 'passenger' && (
        <>
          <div id="map" className="absolute inset-0 z-0" />

          {/* Floating адрес өрістері */}
          <div className="absolute top-36 left-4 right-4 z-50 bg-white text-black rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} className="flex-1 bg-transparent text-lg font-medium outline-none" placeholder="Қайдан аламыз?" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="flex-1 bg-transparent text-lg font-medium outline-none" placeholder="Қайда барамыз?" />
            </div>
          </div>

          {/* Үлкен шақыру батырмасы (Uber сияқты) */}
          <div className="absolute bottom-8 left-4 right-4 z-50">
            <button className="w-full bg-green-500 hover:bg-green-600 transition-all py-6 rounded-3xl text-2xl font-bold shadow-2xl active:scale-95">
              {t.call}
            </button>
          </div>
        </>
      )}

      {/* Таксист режимі */}
      {role === 'driver' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Жаңа заказ күтілуде...</h2>
            <p className="text-gray-400 text-xl">Алматыда 12 такси онлайн</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
