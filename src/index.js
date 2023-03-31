import Bot from "meowerbot";
import IRC from "irc-framework";
import dotenv from "dotenv";

dotenv.config();

const meower = new Bot();
const irc = new IRC.Client();
let channel;

irc.on("registered", () => {
    irc.join(process.env.I2M_IRC_CHANNEL);

    channel = irc.channel(process.env.I2M_IRC_CHANNEL);
    channel.join();

    irc.on("message", (ctx) => {
        if (ctx.nick.match(/.*Serv/i)) return;
        meower.post(`${ctx.nick}: ${ctx.message}`);
    });
});

irc.connect({
    host: process.env.I2M_IRC_URL,
    port: 6667,
    nick: process.env.I2M_USERNAME,
    account: {
        account: process.env.I2M_USERNAME,
        password: process.env.I2M_PASSWORD,
    },
});

meower.onPost((username, content, origin) => {
    if (origin != null) return;
    channel.say(`${username}: ${content}`);
});

meower.login(process.env.I2M_USERNAME, process.env.I2M_PASSWORD);