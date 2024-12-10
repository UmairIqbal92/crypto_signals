const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Telegram Bot Token (replace with your actual bot token)
const botToken = '7916658911:AAGhrHSmrxms_k-6WQ96vhVfXrcOAzO0FIM';
const groupChatId = '-2290339976'; // Replace with your group's chat ID

// Create Telegram Bot Instance
const bot = new TelegramBot(botToken, { polling: true })
;

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

// Send Signals to the Group Every Minute
async function sendSignalsToGroup() {
  const signalMessage = await fetchSignal();
  bot.sendMessage(groupChatId, signalMessage, { parse_mode: 'Markdown' });
}

// Schedule Signal Sending Every Minute
setInterval(() => {
  console.log('Sending signal to group...');
  sendSignalsToGroup();
}, 60 * 1000);

// Optional: Log when the bot starts
bot.on('polling_error', (error) => console.error('Polling error:', error.message));
bot.on('message', (msg) => {
  console.log('Message received:', msg.text);
});
