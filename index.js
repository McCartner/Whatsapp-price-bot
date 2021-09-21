const { Client } = require('whatsapp-web.js');
const Binance = require('node-binance-api');
const fs = require('fs');

const SESSION_FILE_PATH = './session.json';
let sessionCfg;

if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const binanceClient = new Binance().options({
  apiKey: '',
  apiSecret: '',
})

const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });
client.initialize();

client.on('qr', (qr) => {
    console.log('Code: ', qr);
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {

    const args = message.body.split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "/p" || command === "/price") {
      if (args.length === 0) {
        console.log(args);
        message.reply("Please enter coin name")
      } else if (args.length === 1) {
        console.log(args);
        let data = args[0] + `USDT`;
        let price = await binanceClient.prices();
        message.reply(`Price of ${data.toUpperCase()}: ` + price[data.toUpperCase()]);
      } else if (args.length === 2) {
        console.log(args);
        let data = args[0] + args[1];
        let price = await binanceClient.prices();
        message.reply(`Price of ${data.toUpperCase()}: ` + price[data.toUpperCase()]);
      } else {
        message.reply(`I don't know what you mean by this`);
      }
    }

});
