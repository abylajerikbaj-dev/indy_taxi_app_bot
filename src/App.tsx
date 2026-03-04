import { TonConnectButton } from '@tonconnect/ui-react';
import { useState } from 'react';

function App() {
  const [role, setRole] = useState<'passenger' | 'driver' | 'courier'>('passenger');

  const [user] = useState({
    name: "Абылай",
    car: "Toyota Camry 2022",
    rating: "4.9 ★"
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚖 Indy Taxi TON</h1>
        <TonConnectButton />
      </div>

      {/* Рөл таңдау */}
      <div className="flex gap-3 mb-8">
        <button onClick={() => setRole('passenger')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'passenger' ? 'bg-blue-600' : 'bg-gray-800'}`}>
          👤 Жолаушы
        </button>
        <button onClick={() => setRole('driver')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'driver' ? 'bg-blue-600' : 'bg-gray-800'}`}>
          🚕 Таксист
        </button>
        <button onClick={() => setRole('courier')} className={`flex-1 py-4 rounded-2xl font-bold ${role === 'courier' ? 'bg-blue-600' : 'bg-gray-800'}`}>
          📦 Курьер
        </button>
      </div>

      {/* Профиль */}
      <div className="bg-gray-900 p-5 rounded-2xl mb-6">
        <h2 className="text-xl font-semibold mb-3">Профиль</h2>
        <p><strong>Аты:</strong> {user.name}</p>
        <p><strong>Көлік:</strong> {user.car}</p>
        <p><strong>Рейтинг:</strong> {user.rating}</p>
        <button className="w-full bg-blue-600 py-3 mt-4 rounded-xl font-medium">
          📄 Көлік құжаттары + сақтандыру жүктеу
        </button>
      </div>

      {/* Пікірлер */}
      <div className="bg-gray-900 p-5 rounded-2xl mb-6">
        <h2 className="text-xl font-semibold mb-3">Пікірлер мен бағалар</h2>
        <div className="mb-4 bg-gray-800 p-4 rounded-xl">
          <p><strong>Айгүл</strong> — 5★</p>
          <p>Жылдам келді, әдепті жүргізуші!</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl">
          <p><strong>Нұрлан</strong> — 5★</p>
          <p>ТОН төлемі өте ыңғайлы!</p>
        </div>
      </div>

      {/* Такси шақыру */}
      <button className="w-full bg-green-600 py-4 rounded-2xl text-xl font-bold">
        🚕 Такси шақыру (Алматы)
      </button>
    </div>
  );
}

export default App;
