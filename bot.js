const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Telegram Bot Token (replace with your actual bot token)
const botToken = '7637468356:AAFWoitLk5w8ZZXbIvIydn1M_B_tmsP7yIY';

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
    'x-rapidapi-key': 'ebefe7429emsheede099a8aa1b4ap12b4b0jsnc7c9fabe16a5',
    'x-rapidapi-host': 'ai-crypto-signals-technical-analysis-liquidation-heatmap.p.rapidapi.com',
  },
};

// Store Users Who Start the Bot
const activeUsers = new Set();

// Fetch and Format Signal Data
async function fetchSignal() {
  try {
    const response = await axios.request(options);
    const data = response.data.heatMapAnalysis[0]; // Fetch the latest data point

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
    return message;
  } catch (error) {
    console.error('Error fetching signal:', error.message);
    return 'Error fetching signal data. Please try again later.';
  }
}

// Handle User Commands
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    bot.sendMessage(chatId, 'Welcome to Crypto Signals Bot! You will receive signals every minute. 🚀');
    activeUsers.add(chatId); // Add the user to active users list
  } else if (text === '/stop') {
    bot.sendMessage(chatId, 'You have stopped receiving signals. Use /start to subscribe again.');
    activeUsers.delete(chatId); // Remove the user from active users list
  } else {
    bot.sendMessage(chatId, 'Unknown command. Use /start to receive signals or /stop to unsubscribe.');
  }
});

// Send Signals Every Minute
async function sendSignals() {
  const signalMessage = await fetchSignal();
  activeUsers.forEach((chatId) => {
    bot.sendMessage(chatId, signalMessage, { parse_mode: 'Markdown' });
  });
}

// Schedule Signal Sending Every Minute
setInterval(sendSignals, 60 * 1000);
