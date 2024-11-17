import { sendTelegramMessage } from './utils';

export function createTimeButtons(times) {
  return {
    inline_keyboard: times.map((time) => [
      { text: time, callback_data: `TIME_${time}` },
    ]),
  };
}

export async function handleTimeActions(TELEGRAM_BOT_TOKEN, chatId, callbackData, db) {
  const time = callbackData.split('_')[1];

  try {
    await db.prepare('UPDATE bookings SET booking_time = ? WHERE client_id = ?')
      .bind(time, chatId)
      .run();

    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      `Вы выбрали время: ${time}.`,
      {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: 'Подтвердить запись', callback_data: `CONFIRM_${time}` }],
            [{ text: 'Отмена', callback_data: 'CANCEL' }],
          ],
        }),
      }
    );
  } catch (error) {
    console.error('Ошибка сохранения времени:', error);
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      'Произошла ошибка при сохранении времени. Попробуйте снова.'
    );
  }
}

export async function handleConfirmationActions(TELEGRAM_BOT_TOKEN, chatId, callbackData, db) {
  const action = callbackData.split('_')[0];
  const time = callbackData.split('_')[1];

  if (action === 'CONFIRM') {
    try {
      const result = await db.prepare('SELECT booking_date FROM bookings WHERE client_id = ?')
        .bind(chatId)
        .first();

      const bookingDate = result.booking_date || 'Не указана';

      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `Запись успешно сохранена!\nДата: ${bookingDate}, Время: ${time}`,
        {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: 'Показать календарь', callback_data: 'SHOW_CALENDAR' }],
              [{ text: 'Мои записи', callback_data: 'MY_RECORDS' }],
            ],
          }),
        }
      );
    } catch (error) {
      console.error('Ошибка подтверждения записи:', error);
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        'Произошла ошибка при сохранении записи. Попробуйте снова.'
      );
    }
  } else if (callbackData === 'CANCEL') {
    const availableDates = ['2024-11-20', '2024-11-21'];
    const calendar = createCalendar('CALENDAR', availableDates, 2024, 11);

    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      'Вы отменили выбор времени. Пожалуйста, выберите дату:',
      { reply_markup: JSON.stringify(calendar) }
    );
  } else {
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      'Неизвестная команда. Попробуйте снова.'
    );
  }
}
