import Bot from "meowerbot";
import IRC from "irc-framework";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const meower = new Bot();
const irc = new IRC.Client();
const db = new MongoClient(process.env["I2M_MONGODB_URL"]).db("irc2meower");

let channel;

irc.on("registered", () => {
    irc.join(process.env.I2M_IRC_CHANNEL);

    channel = irc.channel(process.env.I2M_IRC_CHANNEL);
    channel.join();

    irc.on("message", async (ctx) => {
        if (ctx.nick.match(/.*Serv/i)) return;
        const chat = await db.collection("chats").findOne({
            irc_channel: ctx.target
        });
        meower.post(`${ctx.nick}: ${ctx.message}`, chat.meower_gc);
    });
});

irc.connect({
    host: process.env.I2M_IRC_URL,
    port: 6667,
    nick: process.env.I2M_USERNAME,
    account: {
        account: process.env.I2M_USERNAME,
        password: process.env.I2M_PASSWORD,
    }
});

meower.onPost((username, content, origin) => {
    if (origin != null) return;
    channel.say(`${username}: ${content}`);
});

meower.onClose(() => {
    meower.login(process.env.I2M_USERNAME, process.env.I2M_PASSWORD);
});

irc.on("close", () => {
    irc.connect({
        host: process.env.I2M_IRC_URL,
        port: 6667,
        nick: process.env.I2M_USERNAME,
        account: {
            account: process.env.I2M_USERNAME,
            password: process.env.I2M_PASSWORD,
        }
    });
});

meower.login(process.env.I2M_USERNAME, process.env.I2M_PASSWORD);