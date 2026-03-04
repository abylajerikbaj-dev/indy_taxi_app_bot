import { TonConnectButton } from '@tonconnect/ui-react';
import { useState, useEffect } from 'react';

const cities = {
  Almaty: { name: "Алматы", lat: 43.2567, lng: 76.9286, lang: "kk" },
  Moscow: { name: "Москва", lat: 55.7558, lng: 37.6173, lang: "ru" },
  Tashkent: { name: "Ташкент", lat: 41.2995, lng: 69.2401, lang: "uz" },
  Minsk: { name: "Минск", lat: 53.9006, lng: 27.5590, lang: "ru" },
  Bishkek: { name: "Бішкек", lat: 42.8746, lng: 74.5698, lang: "ky" }
};

function App() {
  const [role, setRole] = useState<'passenger' | 'driver' | 'courier'>('passenger');
  const [city, setCity] = useState('Almaty');
  const [user] = useState({ name: "Абылай", car: "Toyota Camry 2022", rating: "4.9 ★" });

  // Карта (қалаға байланысты өзгереді)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.L) {
      const map = window.L.map('map').setView([cities[city].lat, cities[city].lng], 13);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      window.L.marker([cities[city].lat, cities[city].lng]).addTo(map).bindPopup(`${cities[city].name} — Такси шақыру`);
    }
  }, [city]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚖 Indy Taxi TON</h1>
        <TonConnectButton />
      </div>

      {/* Қала таңдау (СНГ) */}
      <select 
        value={city} 
        onChange={(e) => setCity(e.target.value)}
        className="w-full bg-gray-800 p-4 rounded-2xl mb-6 text-lg"
      >
        {Object.keys(cities).map(c => (
          <option key={c} value={c}>{cities[c].name}</option>
        ))}
      </select>

      {/* Рөл таңдау */}
      <div className="flex gap-3 mb-8 bg-gray-900 p-2 rounded-3xl">
        <button onClick={() => setRole('passenger')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'passenger' ? 'bg-blue-600' : 'bg-gray-800'}`}>👤 Жолаушы</button>
        <button onClick={() => setRole('driver')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'driver' ? 'bg-blue-600' : 'bg-gray-800'}`}>🚕 Таксист</button>
        <button onClick={() => setRole('courier')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'courier' ? 'bg-blue-600' : 'bg-gray-800'}`}>📦 Курьер</button>
      </div>

      {/* Карта */}
      {role === 'passenger' && (
        <div className="bg-gray-900 p-5 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold mb-3">📍 {cities[city].name} картасы</h2>
          <div id="map" className="w-full h-80 rounded-xl overflow-hidden"></div>
        </div>
      )}

      {/* Профиль + құжаттар */}
      <div className="bg-gray-900 p-5 rounded-2xl">
        <h2 className="text-xl font-semibold mb-3">Профиль</h2>
        <p><strong>Аты:</strong> {user.name}</p>
        <p><strong>Көлік:</strong> {user.car}</p>
        <p><strong>Рейтинг:</strong> {user.rating}</p>
        <button className="w-full bg-blue-600 py-3 mt-4 rounded-xl font-medium">
          📄 Көлік құжаттары + сақтандыру жүктеу
        </button>
      </div>
    </div>
  );
}

export default App;
