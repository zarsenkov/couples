import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Импортируем иконки с исправленными названиями
import { 
  Heart, 
  ChevronLeft, 
  RotateCcw, 
  UserRound as UserHeart, // Заменяем отсутствующий UserHeart
  BookText as BookHeart,   // Заменяем отсутствующий BookHeart
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { STORIES } from './data';

export default function App() {
  // --- СОСТОЯНИЯ ПРИЛОЖЕНИЯ (STATE) ---
  
  // screen отвечает за то, какой экран видит пользователь (setup, lobby, quest, results)
  const [screen, setScreen] = useState('setup'); 
  
  // Храним имена, загружая их из памяти браузера, если они там есть
  const [names, setNames] = useState({ 
    p1: localStorage.getItem('ls_p1') || '', 
    p2: localStorage.getItem('ls_p2') || '' 
  });

  const [currentStory, setCurrentStory] = useState(null); // ID текущей истории
  const [phaseIdx, setPhaseIdx] = useState(0);           // Индекс текущей главы
  const [stepIdx, setStepIdx] = useState(0);             // Индекс текущего шага в главе
  const [honestyScore, setHonestyScore] = useState(0);   // Счетчик "честных" ответов
  const [totalQuestions, setTotalQuestions] = useState(0); // Всего вопросов задано
  const [showDuel, setShowDuel] = useState(false);       // Показ модалки "Колесо судьбы"
  const [showHonesty, setShowHonesty] = useState(false); // Показ модалки проверки честности
  const [winner, setWinner] = useState(null);            // Победитель в дуэли

  // --- ЭФФЕКТЫ (EFFECTS) ---

  // Проверяем при запуске: если имена уже вводились ранее, сразу идем в лобби
  useEffect(() => {
    if (names.p1 && names.p2) setScreen('lobby');
  }, [names]);

  // --- ОБРАБОТЧИКИ СОБЫТИЙ (LOGIC) ---

  // Функция сохранения имен и перехода к выбору историй
  const handleStart = () => {
    if (names.p1.trim().length < 2 || names.p2.trim().length < 2) return;
    localStorage.setItem('ls_p1', names.p1);
    localStorage.setItem('ls_p2', names.p2);
    setScreen('lobby');
  };

  // Функция запуска квеста (сбрасывает прогресс предыдущей игры)
  const startStory = (id) => {
    setCurrentStory(id);
    setPhaseIdx(0);
    setStepIdx(0);
    setHonestyScore(0);
    setTotalQuestions(0);
    setScreen('quest');
  };

  // Функция оценки честности (начисляем балл, если партнер нажал "Верю")
  const rateHonesty = (isHonest) => {
    if (isHonest) setHonestyScore(prev => prev + 1);
    setShowHonesty(false);
    setStepIdx(prev => prev + 1); // Идем к следующей карточке
  };

  // Логика "Колеса судьбы" (выбирает случайное имя через паузу)
  const runDuel = () => {
    setWinner("ВЫБОР...");
    setTimeout(() => {
      const lucky = Math.random() > 0.5 ? names.p1 : names.p2;
      setWinner(lucky.toUpperCase());
      setTimeout(() => {
        setShowDuel(false);
        setWinner(null);
        setStepIdx(prev => prev + 1);
      }, 2000); // Показываем победителя 2 секунды
    }, 1500);
  };

  // --- РЕНДЕР ИГРОВОГО КОНТЕНТА ---

  // Функция определяет, что рисовать: слова Амалии или карточку задания
  const renderQuest = () => {
    const story = STORIES[currentStory];
    const phase = story.phases[phaseIdx];
    const isNpcStep = stepIdx < phase.npc.length;

    // Сначала показываем сообщения NPC (Амалии)
    if (isNpcStep) {
      return (
        <div className="npc-container">
          <div className="amalia-icon">🌸</div>
          <div className="clay-box npc-bubble">
            <p>{phase.npc[stepIdx].text}</p>
            <button className="btn-clay primary" onClick={() => setStepIdx(stepIdx + 1)}>Продолжить</button>
          </div>
        </div>
      );
    }

    // Затем показываем сами игровые карточки
    const card = phase.cards[stepIdx - phase.npc.length];
    
    // Если карточки кончились — переходим в след. фазу или на экран финала
    if (!card) {
      if (phaseIdx < story.phases.length - 1) {
        setPhaseIdx(phaseIdx + 1);
        setStepIdx(0);
      } else {
        setScreen('results');
      }
      return null;
    }

    // Подставляем реальные имена в текст карточки
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
            {card.type === 'question' ? 'ОТВЕТ ДАН' : 'МЫ СДЕЛАЛИ'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="app-shell" style={{ backgroundColor: currentStory ? STORIES[currentStory].phases[phaseIdx].bg : '#fff0f3' }}>
      
      {/* ЭКРАН 1: РЕГИСТРАЦИЯ ИМЕН */}
      {screen === 'setup' && (
        <section className="screen active">
          <div className="hero"><h1>LOVE<span>STORY</span></h1></div>
          <div className="clay-card">
            <input className="joy-input" placeholder="Имя 1" value={names.p1} onChange={e => setNames({...names, p1: e.target.value})} />
            <input className="joy-input" placeholder="Имя 2" value={names.p2} onChange={e => setNames({...names, p2: e.target.value})} style={{marginTop: '15px'}} />
            <button className="btn-clay primary" style={{marginTop: '25px'}} onClick={handleStart}>СОЗДАТЬ РОМАН</button>
          </div>
        </section>
      )}

      {/* ЭКРАН 2: ВЫБОР СЮЖЕТА */}
      {screen === 'lobby' && (
        <section className="screen active">
          <div className="lobby-header"><h2>ВАШИ ИСТОРИИ</h2> <BookHeart color="#ff4d6d" /></div>
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

      {/* ЭКРАН 3: ИГРОВОЙ ПРОЦЕСС */}
      {screen === 'quest' && (
        <section className="screen active">
          <div className="quest-header">
            <button className="btn-mini" onClick={() => setScreen('lobby')}><ChevronLeft /></button>
            <div className="progress-heart"><Heart fill="#ff4d6d" color="#ff4d6d" /></div>
          </div>
          {renderQuest()}

          {/* МОДАЛЬНОЕ ОКНО: ДУЭЛЬ (ВЫБОР ИГРОКА) */}
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

          {/* МОДАЛЬНОЕ ОКНО: ПРОВЕРКА ЧЕСТНОСТИ */}
          <AnimatePresence>
            {showHonesty && (
              <motion.div initial={{y:300}} animate={{y:0}} exit={{y:300}} className="overlay-bottom">
                <div className="clay-box honesty-modal">
                  <h3>ПАРТНЕР НЕ ЛУКАВИЛ?</h3>
                  <div className="honesty-row">
                    <button className="btn-clay green" onClick={() => rateHonesty(true)}>ВЕРЮ</button>
                    <button className="btn-clay red" onClick={() => rateHonesty(false)}>НЕ ВЕРЮ</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ЭКРАН 4: РЕЗУЛЬТАТЫ ИГРЫ */}
      {screen === 'results' && (
        <section className="screen active result-screen">
          <div className="clay-card">
            <UserHeart size={64} color="#ff4d6d" />
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
