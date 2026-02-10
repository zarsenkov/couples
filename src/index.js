// Импортируем библиотеку React для работы с компонентами
import React from 'react';
// Импортируем метод для отрисовки приложения в DOM (дерево HTML)
import ReactDOM from 'react-dom/client';
// Подключаем файл стилей Claymorphism
import './index.css';
// Импортируем главный компонент нашей игры
import App from './App';

// Создаем "корень" приложения, привязываясь к тегу с id="root" в index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Запускаем отрисовку приложения внутри StrictMode для проверки кода на ошибки
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
