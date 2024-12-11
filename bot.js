const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const winston = require('winston');

// Telegram Bot Token (replace with your actual bot token)
const botToken = '7916658911:AAGhrHSmrxms_k-6WQ96vhVfXrcOAzO0FIM';
const groupChatId = '-1004747112599'; // Replace with your specific group ID (use -100 prefix for supergroups)

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

// Handle Messages (Ignore All Except Specific Group)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (chatId.toString() !== groupChatId) {
    logger.info('Ignored message from unauthorized chat', { chatId });
    return; // Ignore messages from private chats or other groups
  }

  logger.info('Received message in target group', { chatId, text: msg.text });

  if (msg.text === '/start') {
    bot.sendMessage(chatId, 'Welcome to Crypto Signals Bot! I will send signals every minute in this group. 🚀');
  } else if (msg.text === '/stop') {
    bot.sendMessage(chatId, 'Stopping signals is not allowed for this group.');
  } else {
    logger.warn('Unknown command received in group', { chatId, text: msg.text });
  }
});

// Send Signals to the Specific Group Only
async function sendSignalsToGroup() {
  const signalMessage = await fetchSignal();
  try {
    await bot.sendMessage(groupChatId, signalMessage, { parse_mode: 'Markdown' });
    logger.info('Signal sent to group:', { groupChatId });
  } catch (error) {
    logger.error('Error sending signal to group', { error: error.message });
  }
}

// Schedule Signal Sending Every Minute
setInterval(() => {
  logger.info('Sending signals to the target group...');
  sendSignalsToGroup();
}, 60 * 1000);
