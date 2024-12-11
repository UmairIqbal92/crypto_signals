const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const winston = require('winston');

// Telegram Bot Token (replace with your actual bot token)
const botToken = '7916658911:AAGhrHSmrxms_k-6WQ96vhVfXrcOAzO0FIM';

// Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'bot.log' }), // Log to a file
  ],
});

// Create Telegram Bot Instance
const bot = new TelegramBot(botToken, { polling: true });

// API Request Options
const options = {
  method: 'GET',
  url: 'https://ai-crypto-signals-technical-analysis-liquidation-heatmap.p.rapidapi.com/analyzeLiquidationHeatMap',
  params: {
    noqueue: '1',
    limit: '50',
    timeframe: '1h',
    symbol: 'BTCUSDT',
  },
  headers: {
    'x-rapidapi-key': '209fc7f1a7msh11b6cee2029972cp159c2ejsn6dc4000b7301',
    'x-rapidapi-host': 'ai-crypto-signals-technical-analysis-liquidation-heatmap.p.rapidapi.com',
  },
};

// Store Users Who Start the Bot
const activeUsers = new Set();

// Fetch and Format Signal Data
async function fetchSignal() {
  logger.info('Fetching signal from API...');
  try {
    const response = await axios.request(options);
    const data = response.data.heatMapAnalysis[0]; // Fetch the latest data point

    // Log API response for debugging
    logger.debug('API Response', { data });

    // Format the message
    const message = `
📊 **Signal for BTC/USDT**
- ⏰ **Timestamp**: ${new Date(data.timestamp).toLocaleString()}
- 📈 **Long/Short Ratio**: ${data.longShortRatio}
- 🟩 **Long Accounts**: ${(data.longAccount * 100).toFixed(2)}%
- 🟥 **Short Accounts**: ${(data.shortAccount * 100).toFixed(2)}%
- 💵 **Buy/Sell Ratio**: ${data.buySellRatio}
- 🔥 **Total Liquidation**: ${data.totalLiquidationAmount.toFixed(2)} USDT
- 💹 **Market Price**: ${data.marketPrice}
- 📌 **Price Action**: ${data.priceAction}
- 🧠 **Analysis**: ${data.analysis}
    `;

    logger.info('Signal fetched successfully');
    return message;
  } catch (error) {
    logger.error('Error fetching signal', { error: error.message });
    return 'Error fetching signal data. Please try again later.';
  }
}

// Handle User Commands
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  logger.info('Received message', { chatId, text });

  if (text === '/start') {
    logger.info('User subscribed', { chatId });
    bot.sendMessage(chatId, 'Welcome to Crypto Signals Bot! You will receive signals every minute. 🚀');
    activeUsers.add(chatId); // Add the user to active users list
  } else if (text === '/stop') {
    logger.info('User unsubscribed', { chatId });
    bot.sendMessage(chatId, 'You have stopped receiving signals. Use /start to subscribe again.');
    activeUsers.delete(chatId); // Remove the user from active users list
  } else {
    logger.warn('Unknown command received', { chatId, text });
    bot.sendMessage(chatId, 'Unknown command. Use /start to receive signals or /stop to unsubscribe.');
  }
});

// Send Signals Every Minute
async function sendSignals() {
  const signalMessage = await fetchSignal();
  activeUsers.forEach((chatId) => {
    logger.info('Sending signal to user', { chatId });
    bot.sendMessage(chatId, signalMessage, { parse_mode: 'Markdown' });
  });
}

// Schedule Signal Sending Every Minute
setInterval(() => {
  logger.info('Sending signals to all active users...');
  sendSignals();
}, 60 * 1000);
