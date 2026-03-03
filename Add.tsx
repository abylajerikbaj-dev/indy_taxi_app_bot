import { TonConnectButton } from '@tonconnect/ui-react';
import { useState } from 'react';

function App() {
  const [user] = useState({
    name: "Абылай",
    car: "Toyota Camry 2022",
    rating: "4.9 ★"
  });

  const [reviews] = useState([
    { name: "Айгүл", text: "Жылдам келді, әдепті жүргізуші!", stars: 5 },
    { name: "Нұрлан", text: "ТОН төлемі өте ыңғайлы!", stars: 5 }
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚖 Indy Taxi TON</h1>
        <TonConnectButton />
      </div>

      <div className="bg-gray-900 p-5 rounded-2xl mb-6">
        <h2 className="text-xl font-semibold mb-3">Профиль</h2>
        <p><strong>Аты:</strong> {user.name}</p>
        <p><strong>Көлік:</strong> {user.car}</p>
        <p><strong>Рейтинг:</strong> {user.rating}</p>

        <button className="w-full bg-blue-600 py-3 mt-4 rounded-xl font-medium">
          📄 Көлік құжаттары + сақтандыру жүктеу
        </button>
      </div>

      <div className="bg-gray-900 p-5 rounded-2xl mb-6">
        <h2 className="text-xl font-semibold mb-3">Пікірлер мен бағалар</h2>
        {reviews.map((r, i) => (
          <div key={i} className="mb-4 bg-gray-800 p-4 rounded-xl">
            <p><strong>{r.name}</strong> — {r.stars}★</p>
            <p>{r.text}</p>
          </div>
        ))}
      </div>

      <button className="w-full bg-green-600 py-4 rounded-2xl text-xl font-bold mt-4">
        🚕 Такси шақыру (Алматы)
      </button>
    </div>
  );
}

export default App;
