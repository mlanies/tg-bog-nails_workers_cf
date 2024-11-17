export async function sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, text, options = {}) {
    const payload = {
      chat_id: chatId,
      text,
      ...options,
    };
  
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  