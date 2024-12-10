const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Telegram Bot Token (replace with your actual bot token)
const botToken = '7916658911:AAGhrHSmrxms_k-6WQ96vhVfXrcOAzO0FIM';
const groupChatId = '-1002290339976'; // Add "-100" prefix for supergroup IDs

// Create Telegram Bot Instance with explicit cancellation enabled
const bot = new TelegramBot(botToken, { 
  polling: true, 
  cancellation: true 
});

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
    console.log('Fetched signal successfully:', message);
    return message;
  } catch (error) {
    console.error('Error fetching signal:', error.message);
    throw error; // Rethrow for retry handling
  }
}

// Fetch Signal with Retry Logic
async function fetchSignalWithRetry(retries = 3) {
  while (retries > 0) {
    try {
      return await fetchSignal();
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log('Rate limit exceeded. Retrying...');
        await new Promise((resolve) => setTimeout(resolve, 30 * 1000)); // Wait for 30 seconds
      } else {
        throw error; // If not rate limit, rethrow the error
      }
    }
    retries--;
  }
  return 'Unable to fetch signal due to rate limits. Please try again later.';
}

// Send Signals to the Group
async function sendSignalsToGroup() {
  const signalMessage = await fetchSignalWithRetry();
  try {
    await bot.sendMessage(groupChatId, signalMessage, { parse_mode: 'Markdown' });
    console.log('Signal sent to group:', groupChatId);
  } catch (error) {
    console.error('Error sending signal to group:', error.message);
  }
}

// Schedule Signal Sending Every 2 Minutes
setInterval(() => {
  console.log('Sending signal to group...');
  sendSignalsToGroup();
}, 2 * 60 * 1000); // Adjusted to send every 2 minutes

// Log Incoming Messages
bot.on('message', (msg) => {
  console.log(`Message received in chat (${msg.chat.id}):`, msg.text);
});

// Log Polling Errors
bot.on('polling_error', (error) => console.error('Polling error:', error.message));
