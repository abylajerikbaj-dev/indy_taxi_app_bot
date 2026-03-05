// Add.tsx
import { TonConnectButton } from '@tonconnect/ui-react';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Add = () => {
  const [lang, setLang] = useState<'kk' | 'ru'>('kk');
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [pickup, setPickup] = useState("Алматы орталығы");
  const [destination, setDestination] = useState("Медеу ауданы");
  const [priceOffer, setPriceOffer] = useState(1800);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const mapRef = useRef<any>(null);

  const texts = {
    kk: { title: "Indy Taxi TON", passenger: "👤 Жолаушы", driver: "🚕 Таксист", call: "🚕 Такси шақыру" },
    ru: { title: "Indy Taxi TON", passenger: "👤 Пассажир", driver: "🚕 Водитель", call: "🚕 Вызвать такси" }
  };
  const t = texts[lang];

  // Карта
  useEffect(() => {
    if (role !== 'passenger' || typeof window === 'undefined' || !window.L) return;
    const map = window.L.map('map', { zoomControl: false }).setView([43.2567, 76.9286], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    window.L.marker([43.2567, 76.9286]).addTo(map).bindPopup("📍 Қайдан аламыз?");
    window.L.marker([43.2383, 76.8894]).addTo(map).bindPopup("📍 Қайда барамыз?");
    mapRef.current = map;
    return () => map.remove();
  }, [role]);

  // Socket.IO realtime
  useEffect(() => {
    socket.on('newMessage', (msg: any) => setMessages(prev => [...prev, msg]));
    socket.on('newOrder', (order: any) => setOrders(prev => [...prev, order]));
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = { from: 'me', text: newMessage };
    setMessages(prev => [...prev, msg]);
    socket.emit('sendMessage', msg);
    setNewMessage('');
  };

  const callTaxi = () => {
    const order = { pickup, destination, price: priceOffer };
    socket.emit('newOrder', order);
    alert(`Такси шақырылды!\n${pickup} → ${destination}\nБаға: ${priceOffer} ₸`);
  };

  const markArrived = (orderIndex: number) => {
    alert("Жолаушыға келдік! TON Wallet арқылы автоматты төлем жүзеге асады.");
    setTimeout(() => alert("10 ₸ төлем автоматты түрде алынды!"), 3000);
    const newOrders = [...orders];
    newOrders.splice(orderIndex, 1);
    setOrders(newOrders);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative font-sans">
      {/* Header + TON */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl p-5 flex items-center justify-between border-b border-zinc-800">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <TonConnectButton />
      </div>

      {/* Рөл */}
      <div className="absolute top-24 left-4 right-4 z-50 flex rounded-3xl bg-zinc-900/95 shadow-2xl border border-zinc-700 p-1">
        <button onClick={() => setRole('passenger')} className={`flex-1 py-5 rounded-3xl font-bold text-lg ${role === 'passenger' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg' : 'text-gray-400'}`}>{t.passenger}</button>
        <button onClick={() => setRole('driver')} className={`flex-1 py-5 rounded-3xl font-bold text-lg ${role === 'driver' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg' : 'text-gray-400'}`}>{t.driver}</button>
      </div>

      {/* Жолаушы */}
      {role === 'passenger' && <>
        <div id="map" className="absolute inset-0 z-0" />
        <div className="absolute top-40 left-4 right-4 z-50 bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-zinc-700">
          <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Қайдан аламыз?" className="w-full bg-transparent p-4 mb-3 rounded-2xl outline-none" />
          <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Қайда барамыз?" className="w-full bg-transparent p-4 rounded-2xl outline-none" />
        </div>
        <div className="absolute top-[290px] left-4 right-4 z-50 bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-zinc-700">
          <h3 className="mb-4 font-semibold text-lg">💰 Баға келісу</h3>
          <input type="number" value={priceOffer} onChange={(e) => setPriceOffer(Number(e.target.value))} className="w-full bg-zinc-800 p-5 rounded-2xl text-4xl text-center font-bold outline-none" />
        </div>
        <div className="absolute bottom-8 left-4 right-4 z-50">
          <button onClick={callTaxi} className="w-full py-7 rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-2xl font-bold shadow-2xl active:scale-95 transition-all">{t.call}</button>
        </div>

        {/* Chat */}
        <div className="absolute bottom-28 left-4 right-4 z-50 bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-zinc-700">
          <h3 className="mb-3 font-semibold">💬 Чат</h3>
          <div className="h-40 overflow-y-auto mb-4 bg-zinc-800 p-4 rounded-2xl space-y-3 text-sm">
            {messages.map((m, i) => <p key={i} className={`text-${m.from === 'me' ? 'cyan' : 'white'}-400 text-right`}>{m.text}</p>)}
          </div>
          <div className="flex gap-2">
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Хабарлама..." className="flex-1 bg-zinc-800 p-4 rounded-3xl outline-none" />
            <button onClick={sendMessage} className="bg-blue-600 px-8 rounded-3xl font-medium">Жіберу</button>
          </div>
        </div>
      </>}

      {/* Таксист */}
      {role === 'driver' && <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80">
        <h2 className="text-5xl font-bold mb-6">🚕 Жаңа заказ күтілуде...</h2>
        {orders.map((order, i) => (
          <div key={i} className="mb-4 p-4 bg-zinc-900 rounded-3xl shadow-lg w-80">
            <p>📍 {order.pickup} → {order.destination}</p>
            <p>💰 {order.price} ₸</p>
            <button onClick={() => markArrived(i)} className="mt-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-bold">Келдім</button>
          </div>
        ))}
      </div>}
    </div>
  );
}

export default Add;
