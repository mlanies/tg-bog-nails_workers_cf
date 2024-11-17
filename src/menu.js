import { sendTelegramMessage } from './utils';
import { createCalendar } from './calendar';

export async function handleMenuActions(TELEGRAM_BOT_TOKEN, chatId, callbackData, db) {
  if (callbackData === 'SHOW_CALENDAR') {
    const availableDates = ['2024-11-20', '2024-11-21', '2024-11-22'];
    const calendar = createCalendar('CALENDAR', availableDates, 2024, 11);
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 'Вот календарь:', {
      reply_markup: JSON.stringify(calendar),
    });
  } else if (callbackData === 'MY_RECORDS') {
    const results = await db.prepare('SELECT * FROM bookings WHERE client_id = ?').bind(chatId).all();

    if (results && results.results.length > 0) {
      let message = 'Ваши записи:\n';
      results.results.forEach((record) => {
        const bookingDate = record.booking_date || 'Не указана';
        const bookingTime = record.booking_time || 'Не указано';
        const firstName = record.first_name || 'Не указано';
        const lastName = record.last_name || 'Не указана';

        message += `Дата: ${bookingDate}, \nВремя: ${bookingTime}\nФИО: ${firstName} ${lastName}\n\n`;
      });
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, message);
    } else {
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 'У вас нет записей.');
    }
  }
}
