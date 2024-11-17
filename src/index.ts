import { requestContact, handleContact } from './contact';
import { handleMenuActions } from './menu';
import { handleCalendarActions } from './calendar';
import { handleTimeActions, handleConfirmationActions } from './time';

export default {
  async fetch(request, env) {
    const db = env.DB;
    const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;

    try {
      if (request.method === 'POST') {
        const body = await request.json();

        if (body.message) {
          const { text, contact } = body.message;

          if (text === '/start') {
            await requestContact(TELEGRAM_BOT_TOKEN, body.message.chat.id);
          }

          if (contact) {
            await handleContact(TELEGRAM_BOT_TOKEN, body.message, db);
          }
        }

        if (body.callback_query) {
          const callbackData = body.callback_query.data;
          const chatId = body.callback_query.message.chat.id;

          if (callbackData === 'SHOW_CALENDAR' || callbackData === 'MY_RECORDS') {
            await handleMenuActions(TELEGRAM_BOT_TOKEN, chatId, callbackData, db);
          } else if (callbackData.startsWith('CALENDAR')) {
            await handleCalendarActions(TELEGRAM_BOT_TOKEN, chatId, callbackData, db);
          } else if (callbackData.startsWith('TIME')) {
            await handleTimeActions(TELEGRAM_BOT_TOKEN, chatId, callbackData, db);
          } else if (callbackData.startsWith('CONFIRM') || callbackData === 'CANCEL') {
            await handleConfirmationActions(TELEGRAM_BOT_TOKEN, chatId, callbackData, db);
          } else {
            console.warn('Неизвестный callback:', callbackData);
          }
        }

        return new Response('OK');
      }

      return new Response('This is a Telegram bot', { status: 200 });
    } catch (error) {
      console.error('Ошибка в обработке запроса:', error.message, error.stack);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
