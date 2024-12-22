const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Для запросов к Telegram API
const { Telegraf } = require('telegraf');

// Инициализация
const app = express();
const botToken = '7987142856:AAGbqNgY_tfvhcwLS9s1Pxe_04iGUbOiXIg'; // Замените на токен вашего бота
const bot = new Telegraf(botToken);

// Хранилище пользователей и их токенов (замените на базу данных в продакшене)
let users = {};

// Настройка middleware
app.use(bodyParser.json());

// Маршрут для проверки подписки
app.post('/check-subscription', async (req, res) => {
    const { userId, channelId } = req.body;

    if (!userId || !channelId) {
        return res.status(400).json({ success: false, message: 'userId и channelId обязательны' });
    }

    try {
        // Проверяем подписку через Telegram Bot API
        const response = await axios.get(`https://api.telegram.org/bot${botToken}/getChatMember`, {
            params: {
                chat_id: `@${channelId}`,
                user_id: userId,
            },
        });

        const status = response.data.result?.status;
        if (['member', 'administrator', 'creator'].includes(status)) {
            // Обновляем токены пользователя
            if (!users[userId]) {
                users[userId] = { tokens: 0 };
            }
            users[userId].tokens += 10; // Награда за выполнение задания
            return res.json({ success: true, tokens: users[userId].tokens });
        } else {
            return res.json({ success: false, message: 'Пользователь не подписан' });
        }
    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).json({ success: false, message: 'Ошибка проверки подписки' });
    }
});

// Маршрут для получения данных профиля
app.post('/get-profile', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'userId обязателен' });
    }

    // Возвращаем данные пользователя
    const user = users[userId] || { tokens: 0 };
    res.json({ success: true, tokens: user.tokens });
});

// Запуск сервера
const PORT = 3000; // Замените на нужный вам порт
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
