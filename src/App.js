import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Мы импортируем только базовые вещи, которые не ломают билд
import { STORIES } from './data';

export default function App() {
  // --- СОСТОЯНИЯ ---
  // Управление экранами: setup, lobby, quest, results
  const [screen, setScreen] = useState('setup'); 
  const [names, setNames] = useState({ 
    p1: localStorage.getItem('ls_p1') || '', 
    p2: localStorage.getItem('ls_p2') || '' 
  });

  const [currentStory, setCurrentStory] = useState(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [honestyScore, setHonestyScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showDuel, setShowDuel] = useState(false);
  const [showHonesty, setShowHonesty] = useState(false);
  const [winner, setWinner] = useState(null);

  // --- ЭФФЕКТЫ ---
  // Авто-вход при наличии имен
  useEffect(() => {
    if (names.p1 && names.p2) setScreen('lobby');
  }, [names]);

  // --- ЛОГИКА ---
  // Сохранение имен
  const handleStart = () => {
    if (names.p1.trim().length < 2 || names.p2.trim().length < 2) return;
    localStorage.setItem('ls_p1', names.p1);
    localStorage.setItem('ls_p2', names.p2);
    setScreen('lobby');
  };

  // Начало сюжета
  const startStory = (id) => {
    setCurrentStory(id);
    setPhaseIdx(0);
    setStepIdx(0);
    setHonestyScore(0);
    setTotalQuestions(0);
    setScreen('quest');
  };

  // Кнопка честности
  const rateHonesty = (isHonest) => {
    if (isHonest) setHonestyScore(prev => prev + 1);
    setShowHonesty(false);
    setStepIdx(prev => prev + 1);
  };

  // Жребий (Дуэль)
  const runDuel = () => {
    setWinner("⌛...");
    setTimeout(() => {
      const lucky = Math.random() > 0.5 ? names.p1 : names.p2;
      setWinner(lucky.toUpperCase());
      setTimeout(() => {
        setShowDuel(false);
        setWinner(null);
        setStepIdx(prev => prev + 1);
      }, 2000);
    }, 1200);
  };

  // Отрисовка контента
  const renderQuest = () => {
    const story = STORIES[currentStory];
    const phase = story.phases[phaseIdx];
    const isNpcStep = stepIdx < phase.npc.length;

    if (isNpcStep) {
      return (
        <div className="npc-container">
          <div className="amalia-icon">🌸</div>
          <div className="clay-box npc-bubble">
            <p>{phase.npc[stepIdx].text}</p>
            <button className="btn-clay primary" onClick={() => setStepIdx(stepIdx + 1)}>Далее</button>
          </div>
        </div>
      );
    }

    const card = phase.cards[stepIdx - phase.npc.length];
    
    if (!card) {
      if (phaseIdx < story.phases.length - 1) {
        setPhaseIdx(phaseIdx + 1);
        setStepIdx(0);
      } else {
        setScreen('results');
      }
      return null;
    }

    const text = card.text.replace(/{name1}/g, names.p1).replace(/{name2}/g, names.p2);

    return (
      <div className="action-area">
        <div className="clay-box card-content">
          <p>{text}</p>
        </div>
        {card.type === 'duel' ? (
          <button className="btn-clay primary" onClick={() => setShowDuel(true)}>КТО СЕЙЧАС?</button>
        ) : (
          <button className="btn-clay primary" onClick={() => {
            if (card.type === 'question') {
              setTotalQuestions(prev => prev + 1);
              setShowHonesty(true);
            } else {
              setStepIdx(stepIdx + 1);
            }
          }}>
            {card.type === 'question' ? 'ОТВЕТИЛ(А)' : 'СДЕЛАНО'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="app-shell" style={{ backgroundColor: currentStory ? STORIES[currentStory].phases[phaseIdx].bg : '#fff0f3' }}>
      
      {/* ЭКРАН ВХОДА */}
      {screen === 'setup' && (
        <section className="screen active">
          <div className="hero"><h1>LOVE<span>STORY</span></h1></div>
          <div className="clay-card">
            <input className="joy-input" placeholder="Имя 1" value={names.p1} onChange={e => setNames({...names, p1: e.target.value})} />
            <input className="joy-input" placeholder="Имя 2" value={names.p2} onChange={e => setNames({...names, p2: e.target.value})} style={{marginTop: '15px'}} />
            <button className="btn-clay primary" style={{marginTop: '25px'}} onClick={handleStart}>НАЧАТЬ</button>
          </div>
        </section>
      )}

      {/* ЭКРАН ЛОББИ */}
      {screen === 'lobby' && (
        <section className="screen active">
          <div className="lobby-header"><h2>СЮЖЕТЫ</h2> 📖</div>
          <div className="story-grid">
            {Object.keys(STORIES).map(id => (
              <div key={id} className="clay-box story-card" onClick={() => startStory(id)}>
                <div className="story-icon">{STORIES[id].coverIcon}</div>
                <h3>{STORIES[id].title}</h3>
              </div>
             Dashboard</div>
            ))}
          </div>
        </section>
      )}

      {/* ЭКРАН КВЕСТА */}
      {screen === 'quest' && (
        <section className="screen active">
          <div className="quest-header">
            <button className="btn-mini" onClick={() => setScreen('lobby')}>◀</button>
            <div className="progress-heart">❤️</div>
          </div>
          {renderQuest()}

          <AnimatePresence>
            {showDuel && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="overlay">
                <div className="clay-box duel-modal">
                  <div className="wheel-placeholder">{winner || "?"}</div>
                  <button className="btn-clay primary" onClick={runDuel} disabled={winner}>УЗНАТЬ</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showHonesty && (
              <motion.div initial={{y:300}} animate={{y:0}} exit={{y:300}} className="overlay-bottom">
                <div className="clay-box honesty-modal">
                  <h3>ПАРТНЕР НЕ СОЛГАЛ?</h3>
                  <div className="honesty-row">
                    <button className="btn-clay green" onClick={() => rateHonesty(true)}>ВЕРЮ</button>
                    <button className="btn-clay red" onClick={() => rateHonesty(false)}>НЕТ</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ЭКРАН РЕЗУЛЬТАТОВ */}
      {screen === 'results' && (
        <section className="screen active result-screen">
          <div className="clay-card">
            <div style={{fontSize: '3rem'}}>🎉</div>
            <h2>ИТОГ:</h2>
            <div className="big-score">{totalQuestions > 0 ? Math.round((honestyScore/totalQuestions)*100) : 100}%</div>
            <p>вашей искренности</p>
            <button className="btn-clay primary" onClick={() => setScreen('lobby')}>ВЕРНУТЬСЯ</button>
          </div>
        </section>
      )}
    </div>
  );
}
