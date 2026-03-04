import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://твоя-проект.supabase.co",   // ← ОСЫ ЖЕРГЕ СВОЙ URL-ІҢДІ ҚОЙ
  "твоя-anon-public-key"               // ← ОСЫ ЖЕРГЕ ANON KEY-ІҢДІ ҚОЙ
);

const cities = {
  Almaty:     { name: "Алматы",          lat: 43.2567, lng: 76.9286 },
  Astana:     { name: "Астана",          lat: 51.1694, lng: 71.4491 },
  Moscow:     { name: "Москва",          lat: 55.7558, lng: 37.6173 }
};

function App() {
  const [role, setRole] = useState<'passenger' | 'driver' | 'courier'>('passenger');
  const [city, setCity] = useState<keyof typeof cities>('Almaty');
  const [rideId] = useState(`ride_${Date.now()}`);
  const [tonConnectUI] = useTonConnectUI();

  const mapRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [user] = useState({
    name: "Абылай",
    car: "Toyota Camry 2022",
    rating: "4.9 ★"
  });

  // Реал-тайм карта + таксист қозғалысы (жақсартылған)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.L) return;

    const map = window.L.map('map').setView([cities[city].lat, cities[city].lng], 13);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    mapRef.current = map;

    driverMarkerRef.current = window.L.marker([cities[city].lat, cities[city].lng], {
      icon: window.L.divIcon({ className: 'driver-marker', html: '🚕' })
    }).addTo(map).bindPopup("🚕 Таксист жақындап келеді...");

    setMapLoaded(true);

    // Реал-тайм қозғалыс (Supabase арқылы)
    const channel = supabase.channel(`location-${rideId}`);
    channel.on('broadcast', { event: 'driver_moved' }, ({ payload }) => {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([payload.lat, payload.lng]);
      }
    }).subscribe();

    return () => {
      map.remove();
      supabase.removeChannel(channel);
    };
  }, [city, rideId]);

  // Таксист орнын жіберу
  const sendDriverLocation = () => {
    const newLat = cities[city].lat + (Math.random() * 0.012 - 0.006);
    const newLng = cities[city].lng + (Math.random() * 0.012 - 0.006);

    supabase.channel(`location-${rideId}`).send({
      type: 'broadcast',
      event: 'driver_moved',
      payload: { lat: newLat, lng: newLng }
    });
  };

  // TON төлемі
  const payWithTON = async () => {
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [{ address: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c", amount: "10000000" }]
    };
    try {
      await tonConnectUI.sendTransaction(transaction);
      alert("✅ TON төлемі сәтті! Такси шақырылды");
    } catch (e) {
      alert("❌ Төлем бас тартылды");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚖 Indy Taxi TON</h1>
        <TonConnectButton />
      </div>

      <select 
        value={city} 
        onChange={(e) => setCity(e.target.value as keyof typeof cities)} 
        className="w-full bg-gray-800 p-4 rounded-2xl mb-6 text-lg font-medium"
      >
        {Object.keys(cities).map(key => (
          <option key={key} value={key}>{cities[key as keyof typeof cities].name}</option>
        ))}
      </select>

      <div className="flex gap-3 mb-8 bg-gray-900 p-2 rounded-3xl">
        <button onClick={() => setRole('passenger')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'passenger' ? 'bg-blue-600' : 'bg-gray-800'}`}>👤 Жолаушы</button>
        <button onClick={() => setRole('driver')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'driver' ? 'bg-blue-600' : 'bg-gray-800'}`}>🚕 Таксист</button>
      </div>

      {/* Реал-тайм карта */}
      <div className="bg-gray-900 p-5 rounded-2xl mb-6">
        <h2 className="text-xl font-semibold mb-3">📍 {cities[city].name} — Реал-тайм карта</h2>
        <div id="map" className="w-full h-80 rounded-xl overflow-hidden"></div>
      </div>

      {/* Жолаушы режимі */}
      {role === 'passenger' && (
        <button onClick={payWithTON} className="w-full bg-green-600 py-4 rounded-2xl text-xl font-bold mb-4">
          💎 TON-мен төлеу және такси шақыру
        </button>
      )}

      {/* Таксист режимі */}
      {role === 'driver' && (
        <button onClick={sendDriverLocation} className="w-full bg-green-600 py-4 rounded-2xl text-xl font-bold">
          📍 Орнымды жіберу (реал-тайм)
        </button>
      )}

      {/* Профиль */}
      <div className="bg-gray-900 p-5 rounded-2xl mt-6">
        <h2 className="text-xl font-semibold mb-3">Профиль</h2>
        <p><strong>Аты:</strong> {user.name}</p>
        <p><strong>Көлік:</strong> {user.car}</p>
        <p><strong>Рейтинг:</strong> {user.rating}</p>
      </div>
    </div>
  );
}

export default App;
