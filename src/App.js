import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Volume2, VolumeX, BookHeart, ChevronLeft, RotateCcw } from 'lucide-react';
import { STORIES } from './data';

export default function App() {
  // --- СОСТОЯНИЯ (STATE) ---
  const [screen, setScreen] = useState('setup'); // setup, lobby, quest, album, results
  const [names, setNames] = useState({ p1: localStorage.getItem('ls_p1') || '', p2: localStorage.getItem('ls_p2') || '' });
  const [currentStory, setCurrentStory] = useState(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [honestyScore, setHonestyScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [diary, setDiary] = useState(JSON.parse(localStorage.getItem('ls_diary')) || []);
  const [showDuel, setShowDuel] = useState(false);
  const [showHonesty, setShowHonesty] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);

  // --- ИНИЦИАЛИЗАЦИЯ ---
  useEffect(() => {
    if (names.p1 && names.p2) setScreen('lobby');
  }, []);

  // --- ЛОГИКА ---
  // Сохранение имен и переход в лобби
  const handleStart = () => {
    if (names.p1.length < 2 || names.p2.length < 2) return alert("Введите имена 🌸");
    localStorage.setItem('ls_p1', names.p1);
    localStorage.setItem('ls_p2', names.p2);
    setScreen('lobby');
  };

  // Выбор истории
  const startStory = (id) => {
    setCurrentStory(id);
    setPhaseIdx(0);
    setStepIdx(0);
    setHonestyScore(0);
    setTotalQuestions(0);
    setScreen('quest');
  };

  // Обработка честности
  const rateHonesty = (isHonest) => {
    if (isHonest) setHonestyScore(prev => prev + 1);
    setShowHonesty(false);
    setStepIdx(prev => prev + 1);
  };

  // Колесо судьбы
  const spinWheel = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const win = Math.random() > 0.5 ? names.p1 : names.p2;
      setWinner(win);
      setIsSpinning(false);
      setTimeout(() => {
        setWinner(null);
        setShowDuel(false);
        setStepIdx(prev => prev + 1);
      }, 2000);
    }, 3000);
  };

  // Рендер текущего контента квеста
  const renderQuestContent = () => {
    const story = STORIES[currentStory];
    const phase = story.phases[phaseIdx];
    const isNpc = stepIdx < phase.npc.length;

    if (isNpc) {
      return (
        <div className="npc-block">
          <div className="amalia-avatar talking">🌸</div>
          <div className="npc-bubble clay-box">
            <p>{phase.npc[stepIdx].text}</p>
            <button className="btn-clay primary" onClick={() => setStepIdx(stepIdx + 1)}>Продолжить</button>
          </div>
        </div>
      );
    }

    const card = phase.cards[stepIdx - phase.npc.length];
    if (!card) {
      // Переход к следующей фазе или финал
      if (phaseIdx < story.phases.length - 1) {
        setPhaseIdx(phaseIdx + 1);
        setStepIdx(0);
      } else {
        setScreen('results');
      }
      return null;
    }

    const formattedText = card.text.replace(/{name1}/g, names.p1).replace(/{name2}/g, names.p2);

    return (
      <div className="action-area">
        <div className="card-body clay-box">
          <p>{formattedText}</p>
        </div>
        {card.type === 'duel' ? (
          <button className="btn-clay primary" onClick={() => setShowDuel(true)}>КТО ЖЕ?</button>
        ) : (
          <button className="btn-clay primary" onClick={() => {
            setTotalQuestions(prev => prev + 1);
            setShowHonesty(true);
          }}>
            {card.type === 'question' ? 'Я ОТВЕТИЛ' : 'МЫ СДЕЛАЛИ'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="app-shell" style={{ backgroundColor: currentStory ? STORIES[currentStory].phases[phaseIdx].bg : '#fff0f3' }}>
      
      {/* ЭКРАН: ВХОД */}
      {screen === 'setup' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="screen active">
          <div className="hero">
            <div className="main-orb">🌸</div>
            <h1 className="title">LOVE<span>STORY</span></h1>
          </div>
          <div className="clay-card setup-box">
            <input className="joy-input" placeholder="Имя 1" value={names.p1} onChange={e => setNames({...names, p1: e.target.value})} />
            <input className="joy-input" placeholder="Имя 2" value={names.p2} onChange={e => setNames({...names, p2: e.target.value})} style={{marginTop: '15px'}} />
            <button className="btn-clay primary" style={{marginTop: '25px'}} onClick={handleStart}>ВОЙТИ В ИСТОРИЮ</button>
          </div>
        </motion.section>
      )}

      {/* ЭКРАН: ЛОББИ */}
      {screen === 'lobby' && (
        <section className="screen active">
          <div className="lobby-header">
            <h2>ВАШИ СЮЖЕТЫ</h2>
            <button className="btn-circle" onClick={() => setScreen('album')}><BookHeart /></button>
          </div>
          <div className="story-grid">
            {Object.keys(STORIES).map(key => (
              <div key={key} className="story-card clay-box" onClick={() => startStory(key)}>
                <div className="story-img">{STORIES[key].coverIcon}</div>
                <h3>{STORIES[key].title}</h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ЭКРАН: КВЕСТ */}
      {screen === 'quest' && (
        <section className="screen active">
          <div className="quest-top">
            <button className="btn-mini" onClick={() => setScreen('lobby')}><ChevronLeft /></button>
            <div className="love-jar">
              <div className="liquid" style={{ height: `${(stepIdx / 10) * 100}%` }}></div>
              <Heart size={20} color="white" style={{zIndex: 2}} />
            </div>
          </div>
          {renderQuestContent()}

          {/* Оверлей Дуэли */}
          <AnimatePresence>
            {showDuel && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="duel-overlay">
                <div className="duel-card clay-box">
                  <div className={`wheel ${isSpinning ? 'spinning' : ''}`}>
                    {winner ? winner : '?'}
                  </div>
                  <button className="btn-clay primary" onClick={spinWheel} disabled={isSpinning}>КРУТИТЬ</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Оверлей Честности */}
          <AnimatePresence>
            {showHonesty && (
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="honesty-overlay">
                <div className="honesty-modal clay-box">
                  <h3>ПАРТНЕР БЫЛ ЧЕСТЕН?</h3>
                  <div className="honesty-btns">
                    <button className="btn-clay green" onClick={() => rateHonesty(true)}>ВЕРЮ</button>
                    <button className="btn-clay red" onClick={() => rateHonesty(false)}>НЕТ</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ЭКРАН: РЕЗУЛЬТАТЫ */}
      {screen === 'results' && (
        <section className="screen active">
          <div className="clay-card result-box">
            <h2>ФИНАЛ</h2>
            <div className="score">{Math.round((honestyScore / totalQuestions) * 100)}%</div>
            <p>Уровень вашей искренности</p>
            <button className="btn-clay primary" onClick={() => setScreen('lobby')}>В ЛОББИ</button>
          </div>
        </section>
      )}
    </div>
  );
}
