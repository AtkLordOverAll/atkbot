const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const config = require("./config.json");
const reload = require("reload-require")(module);

let phrases = JSON.parse(fs.readFileSync("./cleanTextResponses.json", "utf8"));
let suggestions = JSON.parse(fs.readFileSync("./cleanTextSuggestions.json", "utf8"));
let alphabet = JSON.parse(fs.readFileSync("./phoneticAlphabet.json", "utf8"));

let echoing = false

// when bot finishes loading
client.on("ready", () => {
    client.user.setPresence({game: {name: config.game, type: 0}});
    console.log("Bot loaded.\n");
});

// message is sent
client.on("message", (message) => {

    // terminates if message is from a bot, then checks for clean text responses and dad joke opportunities, then terminates if no command prefix is found
    if (message.author.bot) {
        return;
    } else if (phrases[message.content.toLowerCase()]) {
        message.channel.send(phrases[message.content.toLowerCase()]);
        console.log("Clean text response given.");
        return;
    } else if (message.content.length < 100) { // limits length of dad jokes
        if (message.content.toLowerCase().startsWith("i'm ")) {
            // dad joke
            message.channel.send(`${dadJoke(message.content, 4)}`);
            return;
        } else if (message.content.toLowerCase().startsWith("im ")) {
            // dad joke
            message.channel.send(`${dadJoke(message.content, 3)}`);
            return;
        } else if (message.content.toLowerCase().startsWith("i am ")) {
            // dad joke
            message.channel.send(`${dadJoke(message.content, 5)}`);
            return;
        } else if (message.content.toLowerCase().startsWith("i m ")) {
            // dad joke (fuck you adam)
            message.channel.send(`${dadJoke(message.content, 4)}`);
        }
    }

    const msgArray = message.content.split(/\s+/g); // deconstructs message down into string array

    if (!message.content.startsWith(config.prefix)) {
        if (echoing) {
            message.channel.send(message.content);
        }
        return;
    } else {
        if (config.prefix[config.prefix.length - 1] == " ") { // gets rid of the command prefix
            msgArray = msgArrary.slice(1);
        } else {
            msgArray[0] = msgArray.slice(config.prefix.length);
        }
        message.content = message.content.slice(config.prefix.length);
        const command = msgArray[0];
    }

    if (message.content.toLowerCase().startsWith("do your army impression")) {
        let msg = message.content.slice(24).toUpperCase();

        message.channel.send(`**Sir ${message.author.username}, yes, sir!**`);

        if (msg == "") {
            return;
        }

        message.delete(1000);

        let out = "";
        let sub = "";
        let skip = false;

        for (let ch = 0; ch < msg.length; ch++) {
            sub = alphabet[msg.charAt(ch)];
            skip = false;

            if (sub != null) {
                out += sub;
            } else {
                out += msg.charAt(ch);
                skip = true;
            }

            if (!skip) {
                out += addSpace(msg, ch);
            }
        }
        message.channel.send(`${out}`);
        return;
    }

    console.log(`Saw message with command ("${message.content}") sent from user ${message.author.username} (ID: ${message.author.id})`);

    // list emojis
    /*if (command === "emojis") {
        message.channel.send(message.guild.emojis.map(e=>e.toString()).join(" "));
        return;
    }*/

    if (command === "rgb" && msgArray.length == 3) {
        let rgb = [0,0,0];
        for (let a = 1; a < 4; a++) {
            rgb[a] = (Math.floor(msgArray[a] / 85));
        }

        let output = "Good question son!.\nAs you can clearly see, ";

        if (rgb[0] === 0) {
            output += "there isn't a lot of red, ";
        } else if (rgb[0] === 1) {
            output += "you've got some red in there, ";
        } else if (rgb[0] > 1) {
            output += "you've got a healthy dollop of red, ";
        }

        if (rgb[1] === 0) {
            output += "not much green, ";
        } else if (rgb[1] === 1) {
            output += "you've got some green, ";
        } else if (rgb[1] > 1) {
            output += "a healthy dollop of Shrek in the mix, ";
        }

        if (rgb[2] === 0) {
            output += "and that's about it to be honest.";
        } else if (rgb[2] === 1) {
            output += "and a splotch of blue to round it all off.";
        } else if (rgb[2] > 1) {
            output += "and holy shit this is my jam!\n*I'm blue da ba dee da ba daa*\n*Da ba dee da ba daa, da ba dee da ba daa, da ba dee da ba daa*\n*Da ba dee da ba daa, da ba dee da ba daa, da ba dee da ba daa*";
            message.channel.send(output);
            return;
        }
        output += "\nI hope that helped you come to terms with that colour you just gave me. I've basically inherited the abilities of one of my many sons, Mallen.";
        message.channel.send(output);
        return;
    }

    if (command === "echo" && message.member.roles.find("name", "Bot Dev")) {
        if (echoing) {
            message.channel.send("Dad echo :(");
            echoing = false;
        } else {
            message.channel.send("Dad echo!");
            echoing = true;
        }
        return;
    }

    // list clean text responses (admin)
    if (command === "aliaslist" && message.member.roles.find("name", "Bot Dev")){
        message.channel.send(`**Current aliases are:**\n${JSON.stringify(phrases).replace(/,/g, "\n").replace(/:/g,": ").replace(/{/g,"").replace(/}/g,"")}`);
        return;
    }

    // list clean text suggestions (admin)
    if (command === "suggestlist" && message.member.roles.find("name", "Bot Dev")){
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

    // add or suggest clean text responses
    if (command === "alias" && message.member.roles.find("name", "Bot Dev")) {
        //phrases[args[0]] = args[1];
        saveJSON(phrases, "./cleanTextResponses.json", "Alias accepted. What are you programming me to become?!", message.channel.id);
    }

    // remove clean text responses (admin)
    if (command === "dealias" && message.member.roles.find("name", "Bot Dev")) {
        //delete phrases[args[0]];
        saveJSON(phrases, "./cleanTextResponses.json", "Alias removed. I feel... lacking.", message.channel.id);
    }

    // evalmsg (admin)
    if (command === "evalmsg" && message.member.roles.find("name", "Bot Dev")) {
        try {
            const code = "message.channel.send(" + message.content.slice(command.length) + ");";
            console.log(code);
            let evaled = eval(code);

            if (typeof evaled !== "string") {
                evaled = require("util").inspect(evaled);
            }

            message.reply(`I ran what you asked me to (I think):\n\`\`\`js\n${code}\`\`\``);
            return;
        } catch (err) {
            message.channel.send(`\`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    }

    // set game (admin)
    if (command === "setgame" && message.member.roles.find("name", "Bot Dev")) {
        client.user.setPresence({game: {name: message.content.slice(command.length), type: 0}});
        return;
    }

    // eval (owner)
    if (command === "eval" && message.author.id === config.ownerID) {
        try {
            const code = message.content.slice(command.length);
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

// used with eval
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

// need I say more
function dadJoke(phrase, snip) {
    let letters = phrase.split("");
    let end = letters.length;
    let capitalise = true;
    for (let a = snip - 1; a < letters.length; a++) {
        if (capitalise === true) {
            letters[a] = letters[a].toUpperCase();
            capitalise = false;
        } else {
            letters[a] = letters[a].toLowerCase();
        }
        if (letters[a] === "." || letters[a] === ",") {
            end = a;
        } else if (letters[a] === " "){
            capitalise = true;
        }
    }
    let output = `Hi ${letters.slice(snip, end).join("")}, I'm Dad.`;
    if (output === "Hi Dad, I'm Dad.") {
        output = "Hi Dad, I'm Dad too. *salutes*";
    }
    console.log(`Dad joke made. ("${output}")`);
    return output;
}

// used for army joke
function addSpace(str, ch) {
    if (ch != str.length - 2) { // Avoid end of array type errors (hopefully)
        if (alphabet[str.charAt(ch + 1)] != null) { // If the next character is going to be substituted
            return " ";
        }
    } else {
        if (alphabet[str.charAt(str.length - 1)] != null) {
            return " ";
        }
    }
    return "";
}

client.login(config.token);
