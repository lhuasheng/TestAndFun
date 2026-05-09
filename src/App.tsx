/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useEffect, useState, useMemo } from 'react';
import { Game } from './components/Game';
import { MobileControls } from './components/MobileControls';
import { useGameStore } from './store';

function HUD() {
  const gameState = useGameStore(state => state.gameState);
  const score = useGameStore(state => state.score);
  const timeLeft = useGameStore(state => state.timeLeft);
  const playerState = useGameStore(state => state.playerState);
  const otherPlayers = useGameStore(state => state.otherPlayers);
  const events = useGameStore(state => state.events);
  const playerCount = Object.keys(otherPlayers).length + 1;
  const leaveGame = useGameStore(state => state.leaveGame);
  const isMobile = useIsMobile();

  const leaderboard = useMemo(() => {
    const players = [
      { id: 'You', score: score, isMe: true },
      ...Object.values(otherPlayers).map(p => ({
        id: p.name,
        score: p.score,
        isMe: false
      }))
    ];
    return players.sort((a, b) => b.score - a.score);
  }, [score, otherPlayers]);

  return (
    <>
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
        <div className="relative">
          <div className={`w-8 h-8 border-4 rounded-full ${playerState === 'disabled' ? 'border-red-500' : 'border-yellow-400'}`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${playerState === 'disabled' ? 'bg-red-500' : 'bg-yellow-400'}`} />
        </div>
        {!isMobile && <div className="mt-4 text-yellow-400 text-xs tracking-widest font-bold drop-shadow-md">READY TO PLAY!</div>}
      </div>

      {/* HUD Left - Score & Leaderboard */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-2 md:gap-4 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm border-4 border-yellow-400 p-2 md:p-4 rounded-3xl shadow-xl">
          <div className="text-pink-500 text-lg md:text-3xl font-black italic">
            POINTS: {score.toString().padStart(4, '0')}
          </div>
        </div>
        
        {!isMobile && (
          <div className="bg-white/70 backdrop-blur-sm border-4 border-sky-400 p-4 rounded-3xl w-56 flex flex-col gap-1 shadow-lg">
            <div className="text-sky-600 text-sm font-black mb-1 border-b-2 border-sky-200 pb-1 text-center">TOP PLAYERS</div>
            {leaderboard.map((p, i) => (
              <div key={p.id} className={`flex justify-between text-sm ${p.isMe ? 'text-pink-500 font-black' : 'text-sky-800'}`}>
                <span>{i + 1}. {p.id}</span>
                <span>{p.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* HUD Right - Time, Leave, Events */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 flex flex-col items-end gap-2 md:gap-4 pointer-events-auto">
        {gameState === 'playing' && (
          <div className="bg-white/80 backdrop-blur-sm border-4 border-sky-400 px-4 py-2 rounded-full shadow-xl">
            <div className="text-sky-500 text-lg md:text-2xl font-black">
              TIME: {Math.floor(timeLeft / 60)}:{(Math.floor(timeLeft) % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}
        <button
          onClick={leaveGame}
          className="px-4 py-2 bg-red-400 border-4 border-red-200 text-white text-xs md:text-sm font-black rounded-full hover:bg-red-500 hover:scale-110 transition-all duration-200 shadow-lg"
        >
          QUIT
        </button>

        {/* Event Log */}
        <div className="mt-2 md:mt-4 flex flex-col items-end gap-2 pointer-events-none">
          {events.slice(-3).map(event => (
            <div key={event.id} className="text-[10px] md:text-xs font-black text-white bg-pink-500 px-4 py-2 rounded-full border-4 border-pink-300 shadow-md animate-bounce">
              {event.message}
            </div>
          ))}
        </div>
      </div>

      {/* Multiplayer Info */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <div className="bg-yellow-400/80 px-4 py-1 rounded-full text-white text-[10px] md:text-sm font-black shadow-md">
          {playerCount} FRIENDS ONLINE
        </div>
      </div>

      {/* Damage Overlay */}
      {playerState === 'disabled' && (
        <div className="absolute inset-0 bg-red-500/20 pointer-events-none flex items-center justify-center">
          <div className="text-red-500 text-4xl md:text-6xl font-black tracking-widest drop-shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse text-center">
            SYSTEM DISABLED
          </div>
        </div>
      )}

      {/* Mobile Controls */}
      {isMobile && gameState === 'playing' && <MobileControls />}
    </>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    const uaMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    return uaMatch || coarsePointer || window.innerWidth < 768;
  });

  useEffect(() => {
    const check = () => {
      const uaMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(uaMatch || coarsePointer || window.innerWidth < 768);
    };
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export default function App() {
  const gameState = useGameStore(state => state.gameState);
  const score = useGameStore(state => state.score);
  const startGame = useGameStore(state => state.startGame);
  const isMobile = useIsMobile();

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden font-mono select-none">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Game />
      </div>

      {/* UI Overlay */}
      {gameState === 'playing' && <HUD />}

      {/* Menus */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-sky-400/40 backdrop-blur-md flex flex-col items-center justify-center z-10 pointer-events-auto">
          <div className="bg-white/90 p-12 rounded-[4rem] border-8 border-yellow-400 shadow-2xl flex flex-col items-center max-w-lg w-full transform hover:scale-105 transition-transform duration-500">
            <h1 className="text-7xl font-black text-pink-500 mb-2 drop-shadow-lg tracking-tighter italic">
              WONDER
            </h1>
            <h2 className="text-5xl font-black text-sky-500 mb-8 drop-shadow-lg tracking-tighter">
              ARENA
            </h2>
            <p className="text-sky-900 font-bold mb-8 text-center text-lg">
              Tag your friends in the magical playground!<br/>
              Be the happiest player today! ✨
            </p>

            <div className="flex flex-col gap-6 w-full">
              <button
                onClick={() => startGame()}
                className="w-full px-8 py-6 bg-yellow-400 border-b-8 border-yellow-600 text-white text-3xl font-black rounded-full hover:bg-yellow-300 hover:-translate-y-1 active:translate-y-1 transition-all duration-200 shadow-xl"
              >
                START MAGIC
              </button>
            </div>
            <p className="mt-6 text-sky-400 text-sm font-black animate-pulse">CLICK ANYWHERE TO AIM</p>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-pink-500/40 backdrop-blur-md flex flex-col items-center justify-center z-10 pointer-events-auto">
          <div className="bg-white/90 p-12 rounded-[4rem] border-8 border-sky-400 shadow-2xl flex flex-col items-center max-w-lg w-full">
            <h1 className="text-6xl font-black text-red-400 mb-4 drop-shadow-lg tracking-tighter italic">
              TIME'S UP!
            </h1>
            <div className="text-4xl text-sky-500 mb-8 font-black">
              SCORE: {score}
            </div>
            <button
              id="start-button"
              onClick={() => startGame()}
              className="w-full px-8 py-6 bg-sky-400 border-b-8 border-sky-600 text-white text-3xl font-black rounded-full hover:bg-sky-300 hover:-translate-y-1 active:translate-y-1 transition-all duration-200 shadow-xl"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
