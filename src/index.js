import Bot from "meowerbot";
import IRC from "irc-framework";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const meower = new Bot();
const irc = new IRC.Client();
const db = new MongoClient(process.env["I2M_MONGODB_URL"]).db("irc2meower");

irc.on("registered", () => {
    irc.join(process.env.I2M_IRC_CHANNEL);

    const channel = irc.channel(process.env.I2M_IRC_CHANNEL);
    channel.join();

    irc.on("message", async (ctx) => {
        const user = await db.collection("users").findOne({ irc: ctx.nick });
        if (ctx.nick.match(/.*Serv/i) || ctx.message.startsWith(`${process.env.I2M_USERNAME} `)) return;

        if (user == null) {
            channel.reply("You haven't linked your account yet!");
            return;
        }

        if (ctx.message.startsWith(`${process.env.I2M_USERNAME} link`)) {
            channel.reply("Linking is not ready yet!");
            return;
        }

        meower.post(`${ctx.nick}: ${ctx.message}`, (process.env.I2M_MEOWER_CHAT === "home" ? null : process.env.I2M_MEOWER_CHAT));
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

meower.onPost(async (username, content, origin) => {
    if (origin != null) return;
    const channel = irc.channel(process.env.I2M_IRC_CHANNEL);
    channel.join();
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
