const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const replies = require("./cleanTextResponses.json");
const fs = require("fs")

// when bot finishes loading
client.on("ready", () => {
  client.user.setGame(`with Atk`);
  console.log("Bot ready");
});

// message is sent
client.on("message", (message) => {

  //checks for clean text responses and then if then terminates if message was from a bot or does not have a command prefix
  if (replies[message.content]) {
    message.channel.send(replies[message.content]);
  } else if (message.author.bot || !message.content.startsWith(config.prefix)) {
    return;
  }
  const args = message.content.split(/\s+/g).slice(1)

  //list emojis
  if (message.content.startsWith(config.prefix + "emojis")) {
    const emojiList = message.guild.emojis.map(e=>e.toString()).join(" ");
    message.channel.send(emojiList);
  }

  // ASL lmao
  if (message.content.startsWith(config.prefix + "asl")) {
    let age = args[0];
    let sex = args[1];
    let location = args[2];
    message.reply(` I see you're a ${age} year old ${sex} from ${location}. Wanna date?`);
  }

  if (message.content.startsWith(config.prefix + "eval") && message.author.id === config.ownerID) {
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string") {
        evaled = require("util").inspect(evaled);
      }

      //message.channel.send(clean(evaled), {code:"x1"});
      message.reply(` ran what you asked me to (I think):\n\`\`\`${code}\`\`\``);
      //message.channel.send(clean(evaled));
    } catch (err) {
      message.channel.send(`\`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
});

// new person joins server
client.on("guildMemberAdd", (member) => {
  member.guild.defaultChannel.send(`$(member.user.username) has joined the server. Say hi!`);
  let baseRole = message.guild.roles.find("name", config.basicRole);
  member.addRole(baseRole).catch(console.error);
});

//shiny clean inputs :3
function clean(text) {
  if(typeof(text) === "string"){
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  } else {
    return text;
  }
}

client.login(config.token);
