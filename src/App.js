// --- ИМПОРТЫ ---
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Импортируем иконки, используя безопасные названия
import { 
  Heart, 
  ChevronLeft, 
  RotateCcw, 
  UserRound as UserHeart, // Вместо отсутствующей UserHeart
  BookText as BookHeart,   // Вместо отсутствующей BookHeart
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { STORIES } from './data';

export default function App() {
  // --- СОСТОЯНИЯ (STATE) ---
  // screen: текущий экран приложения
  const [screen, setScreen] = useState('setup'); 
  // names: имена игроков, загружаемые из локального хранилища
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
  // Если имена уже сохранены в браузере, перекидываем в лобби автоматически
  useEffect(() => {
    if (names.p1 && names.p2) setScreen('lobby');
  }, [names]);

  // --- ЛОГИКА ---
  // Сохранение имен и переход к выбору истории
  const handleStart = () => {
    if (names.p1.trim().length < 2 || names.p2.trim().length < 2) return;
    localStorage.setItem('ls_p1', names.p1);
    localStorage.setItem('ls_p2', names.p2);
    setScreen('lobby');
  };

  // Инициализация начала игры
  const startStory = (id) => {
    setCurrentStory(id);
    setPhaseIdx(0);
    setStepIdx(0);
    setHonestyScore(0);
    setTotalQuestions(0);
    setScreen('quest');
  };

  // Обработка ответа на вопрос о честности
  const rateHonesty = (isHonest) => {
    if (isHonest) setHonestyScore(prev => prev + 1);
    setShowHonesty(false);
    setStepIdx(prev => prev + 1);
  };

  // Функция запуска "Колеса судьбы"
  const runDuel = () => {
    setWinner("ЖРЕБИЙ...");
    setTimeout(() => {
      const lucky = Math.random() > 0.5 ? names.p1 : names.p2;
      setWinner(lucky.toUpperCase());
      setTimeout(() => {
        setShowDuel(false);
        setWinner(null);
        setStepIdx(prev => prev + 1);
      }, 2000);
    }, 1500);
  };

  // Рендер контента (NPC или Карточка задания)
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

    // Замена {name1} и {name2} на реальные имена игроков
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
      
      {/* ЭКРАН: ВВОД ИМЕН */}
      {screen === 'setup' && (
        <section className="screen active">
          <div className="hero"><h1>LOVE<span>STORY</span></h1></div>
          <div className="clay-card">
            <input className="joy-input" placeholder="Имя 1" value={names.p1} onChange={e => setNames({...names, p1: e.target.value})} />
            <input className="joy-input" placeholder="Имя 2" value={names.p2} onChange={e => setNames({...names, p2: e.target.value})} style={{marginTop: '15px'}} />
            <button className="btn-clay primary" style={{marginTop: '25px'}} onClick={handleStart}>НАЧАТЬ ПУТЬ</button>
          </div>
        </section>
      )}

      {/* ЭКРАН: ВЫБОР СЮЖЕТА */}
      {screen === 'lobby' && (
        <section className="screen active">
          <div className="lobby-header"><h2>СЮЖЕТЫ</h2> <BookHeart color="#ff4d6d" /></div>
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

      {/* ЭКРАН: ПРОЦЕСС ИГРЫ */}
      {screen === 'quest' && (
        <section className="screen active">
          <div className="quest-header">
            <button className="btn-mini" onClick={() => setScreen('lobby')}><ChevronLeft /></button>
            <div className="progress-heart"><Heart fill="#ff4d6d" color="#ff4d6d" /></div>
          </div>
          {renderQuest()}

          {/* КОЛЕСО СУДЬБЫ (OVERLAY) */}
          <AnimatePresence>
            {showDuel && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="overlay">
                <div className="clay-box duel-modal">
                  <div className="wheel-placeholder">{winner || "?"}</div>
                  <button className="btn-clay primary" onClick={runDuel} disabled={winner}>КРУТИТЬ</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ПРОВЕРКА ЧЕСТНОСТИ (BOTTOM MODAL) */}
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

      {/* ЭКРАН: ФИНАЛЬНЫЙ СЧЕТ */}
      {screen === 'results' && (
        <section className="screen active result-screen">
          <div className="clay-card">
            <UserHeart size={64} color="#ff4d6d" />
            <h2>РЕЗУЛЬТАТ:</h2>
            <div className="big-score">{totalQuestions > 0 ? Math.round((honestyScore/totalQuestions)*100) : 100}%</div>
            <p>искренности</p>
            <button className="btn-clay primary" onClick={() => setScreen('lobby')}>ВЕРНУТЬСЯ</button>
          </div>
        </section>
      )}
    </div>
  );
}
