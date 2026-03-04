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
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'passenger' | 'driver' | 'courier'>('passenger');
  const [city, setCity] = useState<keyof typeof cities>('Almaty');
  const [rideId] = useState(`ride_${Date.now()}`);
  const [tonConnectUI] = useTonConnectUI();

  const mapRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);

  const [profile] = useState({
    name: "Абылай",
    car: "Toyota Camry 2022",
    rating: "4.9 ★"
  });

  // Анонимді тіркелу (Supabase Auth)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    if (!user) {
      supabase.auth.signInAnonymously();
    }

    return () => listener.subscription.unsubscribe();
  }, [user]);

  // Реал-тайм карта + таксист қозғалысы
  useEffect(() => {
    if (typeof window === 'undefined' || !window.L) return;

    const map = window.L.map('map').setView([cities[city].lat, cities[city].lng], 13);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    mapRef.current = map;

    driverMarkerRef.current = window.L.marker([cities[city].lat, cities[city].lng])
      .addTo(map)
      .bindPopup("🚕 Таксист жақындап келеді...");

    const channel = supabase.channel(`location-${rideId}`);
    channel.on('broadcast', { event: 'driver_moved' }, ({ payload }) => {
      if (driverMarkerRef.current) driverMarkerRef.current.setLatLng([payload.lat, payload.lng]);
    }).subscribe();

    return () => {
      map.remove();
      supabase.removeChannel(channel);
    };
  }, [city, rideId]);

  const sendDriverLocation = () => {
    const newLat = cities[city].lat + (Math.random() * 0.015 - 0.007);
    const newLng = cities[city].lng + (Math.random() * 0.015 - 0.007);
    supabase.channel(`location-${rideId}`).send({
      type: 'broadcast',
      event: 'driver_moved',
      payload: { lat: newLat, lng: newLng }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚖 Indy Taxi TON</h1>
        <div className="flex items-center gap-3">
          <TonConnectButton />
          {user && <button onClick={signOut} className="text-sm bg-red-600 px-4 py-2 rounded-xl">Шығу</button>}
        </div>
      </div>

      <select value={city} onChange={(e) => setCity(e.target.value as keyof typeof cities)} className="w-full bg-gray-800 p-4 rounded-2xl mb-6 text-lg">
        {Object.keys(cities).map(key => (
          <option key={key} value={key}>{cities[key as keyof typeof cities].name}</option>
        ))}
      </select>

      <div className="flex gap-3 mb-8 bg-gray-900 p-2 rounded-3xl">
        <button onClick={() => setRole('passenger')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'passenger' ? 'bg-blue-600' : 'bg-gray-800'}`}>👤 Жолаушы</button>
        <button onClick={() => setRole('driver')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'driver' ? 'bg-blue-600' : 'bg-gray-800'}`}>🚕 Таксист</button>
      </div>

      <div className="bg-gray-900 p-5 rounded-2xl mb-6">
        <h2 className="text-xl font-semibold mb-3">📍 {cities[city].name} — Реал-тайм карта</h2>
        <div id="map" className="w-full h-80 rounded-xl overflow-hidden"></div>
      </div>

      {role === 'passenger' && (
        <button className="w-full bg-green-600 py-4 rounded-2xl text-xl font-bold mb-4">
          💎 TON-мен төлеу және такси шақыру
        </button>
      )}

      {role === 'driver' && (
        <button onClick={sendDriverLocation} className="w-full bg-green-600 py-4 rounded-2xl text-xl font-bold">
          📍 Орнымды жіберу (реал-тайм)
        </button>
      )}

      <div className="bg-gray-900 p-5 rounded-2xl mt-6">
        <h2 className="text-xl font-semibold mb-3">Профиль</h2>
        <p><strong>Аты:</strong> {profile.name}</p>
        <p><strong>Көлік:</strong> {profile.car}</p>
        <p><strong>Рейтинг:</strong> {profile.rating}</p>
      </div>
    </div>
  );
}

export default App;
