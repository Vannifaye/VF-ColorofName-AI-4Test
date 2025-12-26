
import React, { useState } from 'react';
import { geminiService } from './services/geminiService.ts';
import { NamePersona } from './types.ts';

const App: React.FC = () => {
  const [inputName, setInputName] = useState('');
  const [persona, setPersona] = useState<NamePersona | null>(null);
  const [history, setHistory] = useState<NamePersona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundStyle = persona 
    ? { background: `linear-gradient(135deg, ${persona.colors.join(', ')})` }
    : { background: 'linear-gradient(135deg, #1e1e2e, #2a2a40)' };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputName.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await geminiService.generatePersona(inputName.trim());
      const newPersona: NamePersona = {
        name: inputName.trim(),
        colors: data.colors,
        quote: data.quote,
        mood: data.mood,
        timestamp: Date.now(),
      };
      setPersona(newPersona);
      setHistory(prev => [newPersona, ...prev.slice(0, 8)]);
      setInputName('');
    } catch (err: any) {
      setError(err.message || '由于网络或配置原因，无法获取灵感');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (p: NamePersona) => {
    setPersona(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen transition-all duration-1000 ease-in-out flex flex-col items-center p-4 md:p-8" style={backgroundStyle}>
      <header className="w-full max-w-4xl flex flex-col items-center mb-12 mt-8 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg text-center mb-4">
          名字色彩实验室
        </h1>
        <p className="text-white/80 text-lg md:text-xl font-light text-center">
          每一个名字，都有一抹专属的色彩与灵魂
        </p>
      </header>

      <div className="w-full max-w-xl mb-12">
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onFocus={() => setError(null)}
            placeholder="输入你的名字..."
            className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md transition-all placeholder:text-white/40 text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputName.trim()}
            className="bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl min-w-[140px]"
          >
            {isLoading ? '编织中...' : '寻找灵感'}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-900/40 border border-red-500/50 rounded-2xl backdrop-blur-md animate-shake">
            <p className="text-red-200 text-sm text-center font-medium">{error}</p>
          </div>
        )}
      </div>

      {persona && !isLoading && (
        <div className="w-full max-w-4xl animate-slide-up">
          <div className="glass rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden relative group border border-white/20">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div 
                className="w-48 h-48 md:w-64 md:h-64 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/40 transform hover:rotate-6 transition-transform duration-500"
                style={{ background: `linear-gradient(135deg, ${persona.colors.join(', ')})` }}
              >
                <span className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">{persona.name.charAt(0)}</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-4 py-1 rounded-full bg-white/20 border border-white/20 text-sm font-bold mb-4 tracking-widest uppercase">
                  {persona.mood}
                </div>
                <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-md">
                  {persona.name}
                </h2>
                <p className="text-2xl md:text-3xl leading-relaxed italic font-light text-white/90">
                  “{persona.quote}”
                </p>
                <div className="flex flex-wrap gap-3 mt-12 justify-center md:justify-start">
                  {persona.colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-2 bg-black/30 rounded-full pl-1 pr-4 py-1 border border-white/10">
                      <div className="w-6 h-6 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: color }}></div>
                      <span className="text-[10px] font-mono uppercase tracking-tighter opacity-80">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="w-full max-w-4xl mt-24 mb-16 px-4">
          <h3 className="text-xl font-medium mb-8 opacity-60 tracking-widest text-center md:text-left">历史灵感回响</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {history.map((h) => (
              <button
                key={h.timestamp}
                onClick={() => loadFromHistory(h)}
                className="glass rounded-2xl p-4 text-left hover:scale-105 transition-all group border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border border-white/10"
                    style={{ background: `linear-gradient(135deg, ${h.colors.join(', ')})` }}
                  >
                    {h.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-sm truncate">{h.name}</h4>
                    <p className="text-[10px] opacity-50 uppercase">{h.mood}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-auto py-12 text-white/30 text-xs tracking-widest">
        &copy; {new Date().getFullYear()} 名字色彩实验室 &middot; DESIGNED BY AI
      </footer>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-fade-in { animation: fade-in 1s forwards cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-up { animation: slide-up 0.8s forwards cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default App;
