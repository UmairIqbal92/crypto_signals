const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Telegram Bot Token (replace with your actual bot token)
const botToken = '7916658911:AAGhrHSmrxms_k-6WQ96vhVfXrcOAzO0FIM';
const chatId = 'YOUR_CHAT_ID'; // Replace with the chat ID you want to send signals to

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

// Function to Fetch Data and Send Signals
async function fetchAndSendSignal() {
  try {
    const response = await axios.request(options);
    const data = response.data.heatMapAnalysis[0]; // Adjust as per your API response structure

    // Construct the message
    const message = `
📊 **Signal for BTC/USDT**
- 📈 **Long/Short Ratio**: ${data.longShortRatio}
- 🟩 **Long Accounts**: ${data.longAccount * 100}%
- 🟥 **Short Accounts**: ${data.shortAccount * 100}%
- 💵 **Buy/Sell Ratio**: ${data.buySellRatio}
- 🔥 **Total Liquidation**: ${data.totalLiquidationAmount.toFixed(2)} USDT
- 💹 **Market Price**: ${data.marketPrice}
- 📌 **Price Action**: ${data.priceAction}
- 🧠 **Analysis**: ${data.analysis}
`;

    // Send the message via Telegram
    await bot.sendMessage(chatId, message);
    console.log('Signal sent:', message);
  } catch (error) {
    console.error('Error fetching or sending signal:', error.message);
  }
}

// Schedule Signal Every Minute
setInterval(fetchAndSendSignal, 60 * 1000);

// Bot Listener for Commands (Optional)
bot.on('message', (msg) => {
  if (msg.text === '/start') {
    bot.sendMessage(chatId, 'Crypto Signals Bot Started! 🚀');
  }
});
