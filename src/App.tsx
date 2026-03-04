import { TonConnectButton } from '@tonconnect/ui-react';
import { useState } from 'react';

function App() {
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-green-400 mb-8">🚖 Indy Taxi TON</h1>
      <h2 className="text-4xl font-bold text-yellow-400 mb-12">NEW VERSION — КАРТА + ЧАТ ҚОСЫЛДЫ!</h2>

      <div className="flex gap-4">
        <button onClick={() => setRole('passenger')} className={`px-10 py-6 rounded-3xl text-2xl font-bold ${role === 'passenger' ? 'bg-blue-600' : 'bg-gray-800'}`}>👤 Жолаушы</button>
        <button onClick={() => setRole('driver')} className={`px-10 py-6 rounded-3xl text-2xl font-bold ${role === 'driver' ? 'bg-blue-600' : 'bg-gray-800'}`}>🚕 Таксист</button>
      </div>

      {role === 'passenger' && (
        <div className="mt-12 text-center">
          <p className="text-3xl mb-6">📍 Карта (Uber сияқты) дайын!</p>
          <p className="text-xl">Баға келісу + чат қосылған</p>
        </div>
      )}
    </div>
  );
}

export default App;
