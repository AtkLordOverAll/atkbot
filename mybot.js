const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const replies = require("./textOnlyResponses.json");
const fs = require("fs")

// when bot finishes loading
client.on("ready", () => {
  client.user.setGame(`with Atk`);
  console.log("Bot ready");
});

// message is sent
client.on("message", (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(config.prefix + "ping")) {
    message.channel.send("pong!");
  }

  if (message.content.startsWith(config.prefix + "emojis")) {
    const emojiList = message.guild.emojis.map(e=>e.toString()).join(" ");
    message.channel.send(emojiList);
    console.log("Triggered");
  }

  if(replies[message.content]) {
    message.channel.send(replies[message.content]);
  }
});

// new person joins server
client.on("guildMemberAdd", (member) => {
  member.guild.defaultChannel.send("$(member.user.username) has joined the server. Say hi!");
  let baseRole = message.guild.roles.find("name", config.basicRole);
  member.addRole(baseRole).catch(console.error);
});

client.login(config.token);
