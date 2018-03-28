const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const config = require("./config.json");
const reload = require("reload-require")(module);

let phrases = JSON.parse(fs.readFileSync("./cleanTextResponses.json", "utf8"));
let suggestions = JSON.parse(fs.readFileSync("./cleanTextSuggestions.json", "utf8"));
let alphabet = JSON.parse(fs.readFileSync("./phoneticAlphabet.json", "utf8"));
let permLevels = JSON.parse(fs.readFileSync("./permLevels.json", "utf8"))

let echoing = false

// when bot finishes loading
client.on("ready", () => {
    client.user.setPresence({game: {name: config.game, type: 0}});
    updatePerms();
    console.log("Bot loaded.\n");
});

// message is sent
client.on("message", (message) => {

    // terminates if message is from a bot, then checks for clean text responses and dad joke opportunities, then terminates if no command prefix is found
    let regexedMsg = "";
    if (message.content != "") {
        regexedMsg = message.content.toLowerCase().match(/[^*~_]/g);
        regexedMsg = regexedMsg.join('');
    }

    if (message.author.bot) {
        return;
    } else if (phrases[regexedMsg]) {
        message.channel.send(phrases[regexedMsg]);
        console.log(`Alias quoted "${regexedMsg}" -> "${phrases[regexedMsg]}" for ${message.author.username} (ID: ${message.author.id})`);
        return;
    } else if (message.content.length < 100) { // limits length of dad jokes
        if (regexedMsg.startsWith("i'm ")) {
            // dad joke
            message.channel.send(`${dadJoke(regexedMsg, 4)}`);
            return;
        } else if (regexedMsg.startsWith("im ")) {
            // dad joke
            message.channel.send(`${dadJoke(regexedMsg, 3)}`);
            return;
        } else if (regexedMsg.startsWith("i am ")) {
            // dad joke
            message.channel.send(`${dadJoke(regexedMsg, 5)}`);
            return;
        } else if (regexedMsg.startsWith("i m ")) {
            // dad joke (fuck you adam)
            message.channel.send(`${dadJoke(regexedMsg, 4)}`);
        }
    }

    //let rawMsg = message.content; // before it gets chewed up by my processing later
    let msgArray = message.content.split(/\s+/g); // deconstructs message down into string array
    let command = ""

    if (!message.content.startsWith(config.prefix)) {
        if (echoing) {
            message.channel.send(message.content);
        }
        return;
    } else {
        if (config.prefix[config.prefix.length - 1] == " ") { // gets rid of the command prefix
            msgArray = msgArray.slice(1);
        } else {
            msgArray[0] = msgArray.slice(config.prefix.length);
        }
        message.content = message.content.slice(config.prefix.length);
        command = msgArray[0];
    }

    if (permLevels[message.author.id] >= 1) {

        // COMMANDS ANYONE CAN USE HERE

        if (message.content.toLowerCase().startsWith("do your army impression")) {
            let msg = message.content.slice(24).toUpperCase();

            message.channel.send(`**Sir ${message.author.username}, yes, sir!**`);
            console.log(`Did an army impression for ${message.author.username} (ID: ${message.author.id})`);

            if (msg == "") {
                return;
            }

            message.delete(100);

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
            console.log(`Described a colour to ${message.author.username} (ID: ${message.author.id})`);
            return;
        }

    }

    if (permLevels[message.author.id] >= 2) {

        // COMMANDS FOR TIER 2 AND ABOVE USERS HERE

        // add clean text responses
        if (command === "alias") {
            let processThis = message.content.slice(command.length + 1);
            let speechMarkCount = 0;
            if (processThis[0] != '"') {
                return;
            }
            let alias = ["",""];
            for (let i = 1; i < processThis.length; i++) {
                if (processThis[i] == '"') {
                    speechMarkCount++;
                } else if (speechMarkCount < 1) {
                    alias[0] += processThis[i];
                } else if (speechMarkCount == 2) {
                    alias[1] += processThis[i];
                }
            }
            phrases[alias[0].toLowerCase()] = alias[1]; // we aren't fussy about the user's capitalisation, but the bot's is important
            saveJSON(phrases, "./cleanTextResponses.json");
            message.delete(100);
            message.channel.send("New hip and trendy phrase acquired. Watch out kiddos.");
            console.log(`Learnt new alias "${alias[0]}" -> "${alias[1]} from ${message.author.username} (ID: ${message.author.id})"`);
            return;
        }
    }

    if (permLevels[message.author.id] >= 3) {

        // COMMANDS FOR TIER 3 AND ABOVE USERS HERE

        if (command === "echo") {
            if (echoing) {
                message.channel.send("Dad echo :(");
                console.log(`Echoing stopped by ${message.author.username} (ID: ${message.author.id})`);
                echoing = false;
            } else {
                message.channel.send("Dad echo!");
                console.log(`Echoing started by ${message.author.username} (ID: ${message.author.id})`);
                echoing = true;
            }
            return;
        }
    }

    if (permLevels[message.author.id] >= 4) {

        // COMMANDS FOR MODS HERE

        if (message.content.startsWith("set game to")) {
            config.game = message.content.slice(command.length + 1);
            saveJSON(config, "./config.json");
            client.user.setPresence({game: {name: config.game, type: 0}});
            message.channel.send("Game set.");
            console.log(`Game was set to "${message.content.slice(command.length + 1)} by ${message.author.username} (ID: ${message.author.id})"`)
            return;
        }

        // list clean text responses
        if (message.content.startsWith("list aliases")){
            message.author.send(`**Current aliases are:**\n\n${JSON.stringify(phrases).replace(/,/g, "\n").replace(/:/g," -> ").replace(/{/g,"").replace(/}/g,"")}\n\n*Please do not share this around, it will result in swift removal of both your message and ability to use this command.*`);
            message.channel.send(`DM sent 😉`);
            console.log(`Sent list of current aliases to ${message.author.username} (ID: ${message.author.id})`);
            return;
        }

        if (message.content.startsWith("update perms")) {
            updatePerms();
            message.channel.send("Dad's got you covered.");
            return;
        }

        // remove clean text responses
        if (command === "dealias") {
            let toRemove = message.content.slice(command.length + 1).match(/[^"]+/g);
            if (phrases[toRemove]) {
                message.channel.send(`I will no longer say "${phrases[toRemove]}" if you say "${toRemove}". Sorry for any offense caused?`);
                console.log(`Removed alias "${toRemove}" -> "${phrases[toRemove]}", as requested by ${message.author.username} (ID: ${message.author.id})`);
                delete phrases[toRemove];
                saveJSON(phrases, "./cleanTextResponses.json");
            } else {
                message.channel.send("I didn't know I was meant to say something when you said that. Sorry.");
                console.log(`Removing alias ${toRemove} failed, as it doesn't appear to exist. Requested by ${message.author.username} (ID: ${message.author.id})`);
            }
            return;
        }
    }

    if (permLevels[message.author.id] >= 5) {

        // COMMANDS FOR DEVS HERE

        if (message.content.startsWith("list role ids")) {
            let roles = message.guild.roles.array();
            let out = `**__Role IDs__:**\n`;
            for (n = 0; n < roles.length; n++) {
                if (roles[n].name != "@everyone") {
                    out += `**${roles[n].name}**: *${roles[n].id}*\n`;
                }
            }
            message.channel.send(out);
            console.log(`Role IDs were listed for the benefit of ${message.author.username} (ID: ${message.author.id})`);
            return;
        }

        if (message.content.startsWith("log")) {
            console.log(`Logged ${message.content.slice(command.length + 1)} for ${message.author.username} (ID: ${message.author.id})`);
            return;
        }

        if (command === "say") {
            message.delete(50);
            message.channel.send(message.content.slice(command.length + 1));
            console.log(`Said "${message.content.slice(command.length + 1)}" because ${message.author.username} (ID: ${message.author.id}) told me to`);
        }
    }

    if (permLevels[message.author.id] >= 6) {

        // COMMANDS FOR BOT OWNER HERE

        if (command === "eval") {
            try {
                const code = message.content.slice(command.length + 1);
                let evaled = eval(code);

                if (typeof evaled !== "string") {
                    evaled = require("util").inspect(evaled);
                }

                //message.channel.send(clean(evaled), {code:"x1"});
                message.reply(`I ran what you asked me to (I think):\n\`\`\`js\n${code}\`\`\``);
                console.log(`Ran "${code}" for ${message.author.username} (ID: ${message.author.id})`);
                //message.channel.send(clean(evaled));
            } catch (err) {
                message.channel.send(`\`\`\`xl\n${clean(err)}\n\`\`\``);
            }
            return;
        }

        if (command === "evalmsg") {
            try {
                const code = "message.channel.send(" + message.content + ");";
                console.log(code);
                let evaled = eval(code);

                if (typeof evaled !== "string") {
                    evaled = require("util").inspect(evaled);
                }
                message.reply(`I ran what you asked me to (I think):\n\`\`\`js\n${code}\`\`\``);
                console.log(`Ran "${code}" for ${message.author.username} (ID: ${message.author.id})`);
            } catch (err) {
                message.channel.send(`\`\`\`xl\n${clean(err)}\n\`\`\``);
            }
        }
        return;
    }
});

// new person joins server
client.on("guildMemberAdd", (member) => {
    if (!member.bot) {
        member.guild.defaultChannel.send(`Hi ${member.user.toString()} :3 Welcome to the server!`);
        console.log(`User ${member.user.username} (ID: ${member.user.id}) joined the server`);
        member.addRole(config.tier1).catch(console.error);
    } else {
        member.guild.defaultChannel.send("Another bot threatens my presence...\nDad is displeased.");
        console.log(`Bot ${member.user.username} (ID: ${member.user.id}) joined the server`);
    }
    updatePerms();
});

// used with eval
function clean(text) {
    if(typeof(text) === "string"){
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
        return text;
    }
}

function saveJSON(varName, file) {
    fs.writeFile(file, JSON.stringify(varName), err => {
        if (err) {
            console.error(err);
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

// used to update all user permission levels
function updatePerms() {
    let guilds = client.guilds.array();
    let guildMembers;
    permLevels = {}; // wipes permLevels before rebuilding it
    for (let n = 0; n < guilds.length; n++) { // iterate through servers bot is running on
        guildMembers = guilds[n].members.array();
        for (let m = 0; m < guildMembers.length; m++) { // iterate through members in the server
            if (guildMembers[m].bot) {
                permLevels[guildMembers[m].id] = 0;
            } else if (guildMembers[m].id == config.ownerID) {
                permLevels[guildMembers[m].id] = 6; // assuming there are 6 power levels
            } else if (guildMembers[m].roles.has(config.devs)) {
                permLevels[guildMembers[m].id] = 5;
            } else if (guildMembers[m].roles.has(config.mods)) {
                permLevels[guildMembers[m].id] = 4;
            } else if (guildMembers[m].roles.has(config.tier3)) {
                permLevels[guildMembers[m].id] = 3;
            } else if (guildMembers[m].roles.has(config.tier2)) {
                permLevels[guildMembers[m].id] = 2;
            } else if (guildMembers[m].roles.has(config.tier1)) {
                permLevels[guildMembers[m].id] = 1;
            } else {
                permLevels[guildMembers[m].id] = 0;
            }
        }
    }
    permLevels[config.ownerID] = 6;
    saveJSON(permLevels, "./permLevels.json")
    console.log("Updated permissions database.");
}

client.login(config.token);
