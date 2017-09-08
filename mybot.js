const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const config = require("./config.json");
const replies = require("./cleanTextResponses.json");

let phrases = JSON.parse(fs.readFileSync("./cleanTextResponses.json", "utf8"));
let suggestions = JSON.parse(fs.readFileSync("./cleanTextSuggestions.json", "utf8"));

// when bot finishes loading
client.on("ready", () => {
    //client.user.setGame("with Atk");
    console.log("Bot loaded.\n");
});

// message is sent
client.on("message", (message) => {

    //terminates if message is from a bot, then checks for clean text responses, then terminates if no command prefix is found
    if (message.author.bot) {
        return;
    } else if (replies[message.content]) {
        message.channel.send(replies[message.content]);
        return;
    } else if (!message.content.startsWith(config.prefix)) {
        return;
    }
    const args = message.content.split(/\s+/g).slice(1);
    if (args.length === 0) {
        console.log(`Saw ${message.content.split(/\s+/g)[0].substring(1)} command sent from user ${message.author.username} (ID: ${message.author.id})`);
    } else {
        console.log(`Saw ${message.content.split(/\s+/g)[0].substring(1)} command with arguments [${args}], sent from user ${message.author.username} (ID: ${message.author.id})`);
    }

    //list emojis
    if (message.content.startsWith(config.prefix + "emojis")) {
        const emojiList = message.guild.emojis.map(e=>e.toString()).join(" ");
        message.channel.send(emojiList);
        return;
    }

    // ASL lmao
    if (message.content.startsWith(config.prefix + "asl")) {
        let age = args[0];
        let sex = args[1];
        let location = args[2];
        message.reply(` I see you're a ${age} year old ${sex} from ${location}. Wanna date?`);
        return;
    }

    // list clean text responses (admin)
    if ((message.content.startsWith(config.prefix + "aliaslist")) && message.member.roles.find("name", "Bot Dev")){
        message.channel.send(`**Current aliases are:**\n${JSON.stringify(phrases).replace(/,/g, "\n").replace(/:/g,": ").replace(/{/g,"").replace(/}/g,"")}`);
        return;
    }

    // list clean text suggestions (admin)
    if ((message.content.startsWith(config.prefix + "suggestlist")) && message.member.roles.find("name", "Bot Dev")){
        message.channel.send("**Pending Suggestions:**");
        let i,j;
        let output = "";
        for (i in suggestions){
            output += `Suggestion(s) from *${client.users.get(i).username}*: `;
            for (j in suggestions[i]) {
                output += `${suggestions[i][j][0]} => ${suggestions[i][j][1]}, `;
            }
            output += "\n";
        }
        message.channel.send(output);
        return;
    }

    // suggestion approval (admin)
    if ((message.content.startsWith(config.prefix + "acceptalias")) && (message.member.roles.find("name", "Bot Dev"))) {
        // check provided ID
        try {
            let username = client.users.get(args[0]).username;
            if (!suggestions[args[0]]){
                message.channel.send(`User ${username} appears to have no pending suggestions.`);
                return;
            }
        } catch (err) {
            message.channel.send("Failed to find person with that ID on this server. Sorry :'(");
            return;
        }

        // if second argument isn't a number, accept all (probably should change this condition)
        args[1] = parseInt(args[1]) - 1;
        if (args[1] !== args[1]) {
            message.channel.send(`Accepting all of ${client.users.get(args[0]).username}'s suggestions. We're basically related at this point ${args[0].toString()}.`);
            let i;
            for (i in suggestions[args[0]]){
                phrases[suggestions[args[0]][i][0]] = suggestions[args[0]][i][1];
                delete suggestions[args[0]][i];
            }
        } else {
            message.channel.send(`Accepting one of ${client.users.get(args[0]).username}'s suggestions. I feel special :3`);
            phrases[suggestions[args[0]][args[1]][0]] = suggestions[args[0]][args[1]][1];
            delete suggestions[args[0]][args[1]];
        }

        saveJSON(phrases, "./cleanTextResponses.json", "", message.channel.id);
        saveJSON(suggestions, "./cleanTextSuggestions.json", "", message.channel.id);
        return;
    }

    // add or suggest clean text responses
    if ((message.content.startsWith(config.prefix + "alias") && (message.member.roles.find("name", "Bot Dev")))) {
        phrases[args[0]] = args[1];
        saveJSON(phrases, "./cleanTextResponses.json", "Alias accepted. What are you programming me to become?!", message.channel.id);
    } else if (message.content.startsWith(config.prefix + "alias")) {
        //let no = Object.keys(suggestions[message.author.id]).length;
        //console.log(no);
        let count,key = 0;
        for (key in suggestions[message.author.id]) {
            if (suggestions[message.author.id].hasOwnProperty(key)) {
                count++;
            }
        }
        console.log(count);
        //suggestions[message.author.id][no] = [args[0], args[1]];
        //saveJSON(suggestions, "./cleanTextSuggestions.json", "Alias suggested. Are you sure this is good for me?", message.channel.id);
    }

    // remove clean text responses (admin)
    if ((message.content.startsWith(config.prefix + "dealias")) && (message.member.roles.find("name", "Bot Dev"))) {
        delete phrases[args[0]];
        saveJSON(phrases, "./cleanTextResponses.json", "Alias removed. I feel... lacking.", message.channel.id);
    }

    // eval (admin)
    if (message.content.startsWith(config.prefix + "eval") && message.author.id === config.ownerID) {
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string") {
                evaled = require("util").inspect(evaled);
            }

            //message.channel.send(clean(evaled), {code:"x1"});
            message.reply(`I ran what you asked me to (I think):\n\`\`\`js\n${code}\`\`\``);
            //message.channel.send(clean(evaled));
            return;
        } catch (err) {
            message.channel.send(`\`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    }

});

// new person joins server
client.on("guildMemberAdd", (member) => {
    member.guild.defaultChannel.send(`Hi ${member.user.toString()} :3 Welcome to the server!`);
    let baseRole = member.guild.roles.find("name", config.basicRole);
    console.log(`User ${member.user.username} (ID: ${member.user.id}) joined the server`);
    member.addRole(baseRole).catch(console.error);
});

// shiny clean inputs :3
function clean(text) {
    if(typeof(text) === "string"){
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
        return text;
    }
}

// this is the best function
function saveJSON(varName, file, message, id = message.channel.id) {
    fs.writeFile(file, JSON.stringify(varName), err => {
        if (err) {
            console.error(err);
        } else {
            client.channels.get(id).send(message);
            return;
        }
    });
}

client.login(config.token);
