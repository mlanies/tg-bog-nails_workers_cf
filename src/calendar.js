import { sendTelegramMessage } from './utils';
import { createTimeButtons } from './time';

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function createCalendar(name, availableDates, year = null, month = null) {
  const now = new Date();
  if (!year) year = now.getFullYear();
  if (!month) month = now.getMonth() + 1;

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDay = new Date(year, month - 1, daysInMonth).getDay();

  const ignoreCallback = `${name}:IGNORE:${year}:${month}:!`;
  const keyboard = [
    [{ text: `${MONTHS[month - 1]} ${year}`, callback_data: ignoreCallback }],
    DAYS.map((day) => ({ text: day, callback_data: ignoreCallback })),
  ];

  let week = [];
  for (let i = 0; i < firstDay; i++) week.push({ text: ' ', callback_data: ignoreCallback });

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isAvailable = availableDates.includes(date);

    week.push({
      text: `${day}${isAvailable ? '✅' : ''}`,
      callback_data: isAvailable ? `${name}:DAY:${year}:${month}:${day}` : ignoreCallback, // Только доступные даты отправляют запрос
    });

    if (week.length === 7 || day === daysInMonth) {
      keyboard.push(week);
      week = [];
    }
  }

  if (lastDay !== 6) {
    for (let i = lastDay + 1; i < 7; i++) week.push({ text: ' ', callback_data: ignoreCallback });
    keyboard.push(week);
  }

  keyboard.push([
    { text: '<', callback_data: `${name}:PREVIOUS-MONTH:${year}:${month}:!` },
    { text: 'Меню', callback_data: 'MENU' },
    { text: '>', callback_data: `${name}:NEXT-MONTH:${year}:${month}:!` },
  ]);

  return { inline_keyboard: keyboard };
}

export async function handleCalendarActions(TELEGRAM_BOT_TOKEN, chatId, callbackData, db) {
  const [_, action, year, month, day] = callbackData.split(':');
  
  if (action === 'DAY') {
    const selectedDate = `${year}-${month}-${day}`;
    
    // Сохраняем выбранную дату в базе данных
    try {
      await db.prepare('UPDATE bookings SET booking_date = ? WHERE client_id = ?')
        .bind(selectedDate, chatId)
        .run();

      const availableTimes = ['10:00', '12:00', '14:00', '16:00'];
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `Вы выбрали дату: ${selectedDate}. Выберите время:`,
        { reply_markup: JSON.stringify(createTimeButtons(availableTimes)) }
      );
    } catch (error) {
      console.error('Ошибка сохранения даты:', error);
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        'Произошла ошибка при сохранении даты. Попробуйте снова.'
      );
    }
  }
}
