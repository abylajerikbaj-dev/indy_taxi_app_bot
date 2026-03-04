import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://твоя-проект.supabase.co",
  "твоя-anon-public-key"
);

const cities = {
  Almaty: { name: "Алматы", lat: 43.2567, lng: 76.9286 },
  Astana: { name: "Астана", lat: 51.1694, lng: 71.4491 },
  Moscow: { name: "Москва", lat: 55.7558, lng: 37.6173 }
};

function App() {
  const [lang, setLang] = useState<'kk' | 'ru'>('kk');
  const [role, setRole] = useState<'passenger' | 'driver' | 'courier'>('passenger');
  const [city, setCity] = useState<keyof typeof cities>('Almaty');
  const [rideId] = useState(`ride_${Date.now()}`);
  const [tonConnectUI] = useTonConnectUI();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [priceOffer, setPriceOffer] = useState(1800);
  const [offerAccepted, setOfferAccepted] = useState(false);

  const mapRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);

  const texts = {
    kk: { call: "🚕 Такси шақыру", accept: "✅ Қабылдау", sendOffer: "Баға ұсыну" },
    ru: { call: "🚕 Вызвать такси", accept: "✅ Принять", sendOffer: "Предложить цену" }
  };
  const t = texts[lang];

  // Реал-тайм чат (Supabase)
  useEffect(() => {
    const channel = supabase.channel(`chat-${rideId}`);
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `ride_id=eq.${rideId}` }, payload => {
      setMessages(prev => [...prev, payload.new]);
    }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [rideId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase.from('messages').insert({ ride_id: rideId, from_role: role, message: newMessage });
    setNewMessage('');
  };

  // Реал-тайм карта
  useEffect(() => {
    if (typeof window === 'undefined' || !window.L) return;
    const map = window.L.map('map').setView([cities[city].lat, cities[city].lng], 13);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    mapRef.current = map;

    driverMarkerRef.current = window.L.marker([cities[city].lat, cities[city].lng])
      .addTo(map)
      .bindPopup("🚕 Таксист");

    const locChannel = supabase.channel(`location-${rideId}`);
    locChannel.on('broadcast', { event: 'driver_moved' }, ({ payload }) => {
      if (driverMarkerRef.current) driverMarkerRef.current.setLatLng([payload.lat, payload.lng]);
    }).subscribe();

    return () => { map.remove(); supabase.removeChannel(locChannel); };
  }, [city, rideId]);

  const sendDriverLocation = () => {
    const newLat = cities[city].lat + (Math.random() * 0.015 - 0.007);
    const newLng = cities[city].lng + (Math.random() * 0.015 - 0.007);
    supabase.channel(`location-${rideId}`).send({ type: 'broadcast', event: 'driver_moved', payload: { lat: newLat, lng: newLng } });
  };

  const sendPriceOffer = () => {
    setMessages(prev => [...prev, { from_role: 'passenger', message: `Баға ұсынысы: ${priceOffer} тг` }]);
  };

  const acceptOffer = () => {
    setOfferAccepted(true);
    setMessages(prev => [...prev, { from_role: 'driver', message: `✅ Баға қабылданды: ${priceOffer} тг` }]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Тіл таңдау */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setLang('kk')} className={`flex-1 py-3 rounded-2xl ${lang === 'kk' ? 'bg-blue-600' : 'bg-gray-800'}`}>🇰🇿 Қазақша</button>
        <button onClick={() => setLang('ru')} className={`flex-1 py-3 rounded-2xl ${lang === 'ru' ? 'bg-blue-600' : 'bg-gray-800'}`}>🇷🇺 Русский</button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚖 Indy Taxi TON</h1>
        <TonConnectButton />
      </div>

      {/* Рөл таңдау */}
      <div className="flex gap-3 mb-8 bg-gray-900 p-2 rounded-3xl">
        <button onClick={() => setRole('passenger')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'passenger' ? 'bg-blue-600' : 'bg-gray-800'}`}>👤 Жолаушы</button>
        <button onClick={() => setRole('driver')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'driver' ? 'bg-blue-600' : 'bg-gray-800'}`}>🚕 Таксист</button>
      </div>

      {/* Жолаушы — карта + баға + чат */}
      {role === 'passenger' && (
        <>
          <div className="bg-gray-900 p-5 rounded-2xl mb-6">
            <h2 className="text-xl font-semibold mb-3">📍 {cities[city].name} картасы</h2>
            <div id="map" className="w-full h-80 rounded-xl overflow-hidden"></div>
          </div>

          {/* Баға келісу */}
          <div className="bg-gray-900 p-5 rounded-2xl mb-6">
            <h3 className="font-semibold mb-3">💰 Баға келісу</h3>
            <input type="number" value={priceOffer} onChange={(e) => setPriceOffer(Number(e.target.value))} className="w-full bg-gray-800 p-4 rounded-2xl mb-3 text-2xl text-center" />
            <button onClick={sendPriceOffer} className="w-full bg-blue-600 py-4 rounded-2xl font-bold">{t.sendOffer}</button>
          </div>

          {/* Чат */}
          <div className="bg-gray-900 p-5 rounded-2xl mb-6">
            <h3 className="font-semibold mb-3">💬 Чат</h3>
            <div className="h-48 overflow-y-auto mb-3 bg-gray-800 p-3 rounded-xl space-y-2">
              {messages.map((msg, i) => (
                <p key={i} className={msg.from_role === role ? 'text-right text-blue-400' : ''}>
                  <strong>{msg.from_role === 'passenger' ? 'Сіз' : 'Таксист'}:</strong> {msg.message}
                </p>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} className="flex-1 bg-gray-800 p-3 rounded-xl" placeholder="Хабарлама жазыңыз..." />
              <button onClick={sendMessage} className="bg-blue-600 px-6 rounded-xl">Жіберу</button>
            </div>
          </div>
        </>
      )}

      {/* Таксист — баға қабылдау */}
      {role === 'driver' && (
        <div className="bg-gray-900 p-6 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Жаңа заказ</h2>
          <p className="text-xl mb-6">Баға ұсынысы: <span className="text-green-400 font-bold">{priceOffer} тг</span></p>
          <button onClick={acceptOffer} className="w-full bg-green-600 py-5 rounded-2xl text-xl font-bold mb-3">{t.accept}</button>
          <button onClick={sendDriverLocation} className="w-full bg-green-600 py-5 rounded-2xl text-xl font-bold">📍 Орнымды жіберу (реал-тайм)</button>
        </div>
      )}

      {/* Профиль */}
      <div className="bg-gray-900 p-5 rounded-2xl mt-8">
        <h2 className="text-xl font-semibold mb-3">Профиль</h2>
        <p><strong>Аты:</strong> Абылай</p>
        <p><strong>Көлік:</strong> Toyota Camry 2022</p>
        <p><strong>Рейтинг:</strong> 4.9 ★</p>
      </div>
    </div>
  );
}

export default App;
