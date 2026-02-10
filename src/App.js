import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Импортируем только данные из твоего файла
import { STORIES } from './data';

export default function App() {
  // --- СОСТОЯНИЯ ---
  // screen: какой экран показывать сейчас
  const [screen, setScreen] = useState('setup'); 
  // names: имена, которые мы храним в браузере
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
  // Проверка: если имена уже есть, идем в лобби
  useEffect(() => {
    if (names.p1 && names.p2) setScreen('lobby');
  }, [names]);

  // --- ФУНКЦИИ ---
  // Обработка кнопки "Начать"
  const handleStart = () => {
    if (names.p1.trim().length < 2 || names.p2.trim().length < 2) return;
    localStorage.setItem('ls_p1', names.p1);
    localStorage.setItem('ls_p2', names.p2);
    setScreen('lobby');
  };

  // Выбор конкретной истории
  const startStory = (id) => {
    setCurrentStory(id);
    setPhaseIdx(0);
    setStepIdx(0);
    setHonestyScore(0);
    setTotalQuestions(0);
    setScreen('quest');
  };

  // Механика "Колеса судьбы" через текстовый рандом
  const runDuel = () => {
    setWinner("⏳...");
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

  // Основная логика карточек
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
      
      {/* ЭКРАН 1: SETUP */}
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

      {/* ЭКРАН 2: LOBBY */}
      {screen === 'lobby' && (
        <section className="screen active">
          <div className="lobby-header"><h2>СЮЖЕТЫ</h2> 📖</div>
          <div className="story-grid">
            {Object.keys(STORIES).map(id => (
              <div key={id} className="clay-box story-card" onClick={() => startStory(id)}>
                <div className="story-icon">{STORIES[id].coverIcon}</div>
                <h3>{STORIES[id].title}</h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ЭКРАН 3: QUEST */}
      {screen === 'quest' && (
        <section className="screen active">
          <div className="quest-header">
            <button className="btn-mini" onClick={() => setScreen('lobby')}>◀ Назад</button>
            <div className="progress-heart">❤️</div>
          </div>
          {renderQuest()}

          {/* КОЛЕСО / ДУЭЛЬ */}
          <AnimatePresence>
            {showDuel && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="overlay">
                <div className="clay-box duel-modal">
                  <div className="wheel-placeholder">{winner || "?"}</div>
                  <button className="btn-clay primary" onClick={runDuel} disabled={winner}>ЖРЕБИЙ</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* МОДАЛКА ЧЕСТНОСТИ */}
          <AnimatePresence>
            {showHonesty && (
              <motion.div initial={{y:300}} animate={{y:0}} exit={{y:300}} className="overlay-bottom">
                <div className="clay-box honesty-modal">
                  <h3>ПАРТНЕР НЕ СОЛГАЛ?</h3>
                  <div className="honesty-row" style={{display: 'flex', gap: '10px'}}>
                    <button className="btn-clay" style={{background: '#26de81', color: 'white', flex: 1}} onClick={() => {
                        if (totalQuestions > 0) setHonestyScore(prev => prev + 1);
                        setShowHonesty(false);
                        setStepIdx(prev => prev + 1);
                    }}>ВЕРЮ</button>
                    <button className="btn-clay" style={{background: '#ff6b6b', color: 'white', flex: 1}} onClick={() => {
                        setShowHonesty(false);
                        setStepIdx(prev => prev + 1);
                    }}>НЕТ</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ЭКРАН 4: RESULTS */}
      {screen === 'results' && (
        <section className="screen active result-screen">
          <div className="clay-card" style={{textAlign: 'center'}}>
            <div style={{fontSize: '3rem'}}>🎉</div>
            <h2>ИТОГ:</h2>
            <div className="big-score" style={{fontSize: '3rem', fontWeight: 900, color: '#ff4d6d'}}>
              {totalQuestions > 0 ? Math.round((honestyScore/totalQuestions)*100) : 100}%
            </div>
            <p>искренности</p>
            <button className="btn-clay primary" onClick={() => setScreen('lobby')}>В ЛОББИ</button>
          </div>
        </section>
      )}
    </div>
  );
}
