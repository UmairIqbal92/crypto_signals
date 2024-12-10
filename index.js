const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Telegram Bot Token (replace with your actual bot token)
const botToken = '7916658911:AAGhrHSmrxms_k-6WQ96vhVfXrcOAzO0FIM';

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

// Function to Fetch Signal Data
async function fetchSignal() {
  try {
    const response = await axios.request(options);
    const data = response.data.heatMapAnalysis[0]; // Adjust as per your API response structure

    // Construct the message
    const message = `
📊 **Signal for BTC/USDT**
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

// Handle Commands from User
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    bot.sendMessage(chatId, 'Welcome to Crypto Signals Bot! Use /signal to get the latest crypto signal. 🚀');
  } else if (text === '/signal') {
    bot.sendMessage(chatId, 'Fetching the latest signal... ⏳');
    const signalMessage = await fetchSignal();
    bot.sendMessage(chatId, signalMessage, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, 'Unknown command. Use /start or /signal to interact with the bot.');
  }
});
