
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { geminiService } from './services/geminiService';
import { NamePersona } from './types';

const App: React.FC = () => {
  const [inputName, setInputName] = useState('');
  const [persona, setPersona] = useState<NamePersona | null>(null);
  const [history, setHistory] = useState<NamePersona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Background style based on current persona
  const backgroundStyle = persona 
    ? { background: `linear-gradient(135deg, ${persona.colors.join(', ')})` }
    : { background: 'linear-gradient(135deg, #1e1e2e, #2a2a40)' };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputName.trim()) return;

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
      setHistory(prev => [newPersona, ...prev.slice(0, 9)]); // Keep last 10
      setInputName('');
    } catch (err) {
      setError('无法获取灵感，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (p: NamePersona) => {
    setPersona(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ease-in-out flex flex-col items-center p-4 md:p-8`} style={backgroundStyle}>
      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col items-center mb-12 mt-8 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg text-center mb-4">
          名字色彩实验室
        </h1>
        <p className="text-white/80 text-lg md:text-xl font-light text-center">
          每一个名字，都有一抹专属的色彩与灵魂
        </p>
      </header>

      {/* Input Section */}
      <div className="w-full max-w-xl mb-12">
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="输入你的名字..."
            className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md transition-all placeholder:text-white/40"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputName.trim()}
            className="bg-white text-gray-900 font-medium px-8 py-4 rounded-2xl hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                编织色彩中...
              </span>
            ) : '寻找灵感'}
          </button>
        </form>
        {error && <p className="text-red-300 mt-4 text-center bg-red-900/30 py-2 rounded-lg border border-red-500/20">{error}</p>}
      </div>

      {/* Main Result Card */}
      {persona ? (
        <div className="w-full max-w-4xl animate-slide-up">
          <div className="glass rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-40 h-40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/>
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              {/* Visualization */}
              <div 
                className="w-48 h-48 md:w-64 md:h-64 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/30 transform hover:scale-105 transition-transform"
                style={{ background: `linear-gradient(135deg, ${persona.colors.join(', ')})` }}
              >
                <span className="text-4xl md:text-6xl font-bold text-white drop-shadow-md">{persona.name.charAt(0)}</span>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-4 py-1 rounded-full bg-white/20 border border-white/20 text-sm font-medium mb-4">
                  {persona.mood}
                </div>
                <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-sm">
                  {persona.name}
                </h2>
                <div className="relative mb-8">
                  <span className="absolute -top-4 -left-6 text-6xl opacity-20 font-serif">"</span>
                  <p className="text-2xl md:text-3xl leading-relaxed italic font-light">
                    {persona.quote}
                  </p>
                  <span className="absolute -bottom-10 -right-2 text-6xl opacity-20 font-serif">"</span>
                </div>

                <div className="flex flex-wrap gap-3 mt-12 justify-center md:justify-start">
                  {persona.colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-2 bg-black/20 rounded-full pl-1 pr-4 py-1 border border-white/10 hover:bg-black/30 transition-colors">
                      <div className="w-6 h-6 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: color }}></div>
                      <span className="text-xs font-mono uppercase tracking-wider">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !isLoading && (
          <div className="text-center opacity-40 mt-12 animate-pulse">
            <p className="text-xl">输入你的名字，开启色彩之旅</p>
          </div>
        )
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="w-full max-w-4xl mt-24 mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl font-semibold">历史灵感</h3>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((h, idx) => (
              <button
                key={h.timestamp}
                onClick={() => loadFromHistory(h)}
                className="group relative overflow-hidden glass rounded-3xl p-6 text-left hover:scale-[1.02] transition-all hover:bg-white/30"
              >
                <div 
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" 
                  style={{ background: `linear-gradient(135deg, ${h.colors.join(', ')})` }}
                />
                <div className="relative z-10 flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold border border-white/20"
                    style={{ background: `linear-gradient(135deg, ${h.colors.join(', ')})` }}
                  >
                    {h.name.charAt(0)}
                  </div>
                  <div className="flex-1 truncate">
                    <h4 className="font-bold text-lg truncate">{h.name}</h4>
                    <p className="text-xs text-white/60 uppercase">{h.mood}</p>
                  </div>
                  <div className="text-white/40 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-12 text-white/40 text-sm">
        &copy; {new Date().getFullYear()} 色彩实验室 &middot; Powered by Gemini AI
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s forwards ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default App;
