import { sendTelegramMessage } from './utils';

export async function requestContact(TELEGRAM_BOT_TOKEN, chatId) {
  const keyboard = {
    keyboard: [
      [{ text: 'Поделиться контактом 📞', request_contact: true }],
    ],
    one_time_keyboard: true,
    resize_keyboard: true,
  };

  await sendTelegramMessage(
    TELEGRAM_BOT_TOKEN,
    chatId,
    'Для записи требуется ваш контактный номер. Пожалуйста, поделитесь контактами:',
    { reply_markup: JSON.stringify(keyboard) }
  );
}

export async function handleContact(TELEGRAM_BOT_TOKEN, message, db) {
  try {
    if (!message.contact) {
      console.error('Контактные данные отсутствуют:', message);
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        message.chat.id,
        'Контактные данные не были отправлены. Попробуйте снова.'
      );
      return;
    }

    const phone_number = message.contact.phone_number || 'Неизвестно';
    const first_name = message.contact.first_name || 'Неизвестно';
    const last_name = message.contact.last_name || 'Неизвестно';
    const user_id = message.contact.user_id || message.chat.id;
    const username = message.chat.username || null;

    console.log('Данные для вставки:', {
      client_id: user_id,
      first_name,
      last_name,
      username,
      phone_number,
    });

    await db.prepare(
      'INSERT OR IGNORE INTO bookings (client_id, first_name, last_name, username, phone_number, booking_time, booking_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(user_id, first_name, last_name, username, phone_number, null, null).run();

    const keyboard = {
      inline_keyboard: [
        [
          { text: 'Показать календарь', callback_data: 'SHOW_CALENDAR' },
          { text: 'Мои записи', callback_data: 'MY_RECORDS' },
        ],
      ],
    };

    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      message.chat.id,
      `Спасибо, ${first_name}! Ваш контакт (${phone_number}) сохранен.`,
      { reply_markup: JSON.stringify(keyboard) }
    );
  } catch (error) {
    console.error('Ошибка при обработке контакта:', error.message, error.stack);
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      message.chat.id,
      'Произошла ошибка при сохранении ваших данных. Попробуйте снова.'
    );
  }
}
