import discord
import json
import re

client = discord.Client()

# Load globals
with open("config.json") as f:
    config = json.load(f)
with open("cleanTextResponses.json") as f:
    CTResponses = json.load(f)
with open("cleanTextSuggestions.json") as f:
    CTSuggestions = json.load(f)
with open("permLevels.json") as f:
    perms = json.load(f)
# End globals

@client.event
async def on_ready():
    print("We up boys")

@client.event
async def on_message(message):
    if message.author.bot:
        return

    cleanMsg = re.sub("(:[^\s]*:)|[~_*`]", "", message.content.lower()) # regex removes :emotes: and *~_` characters

    # Plain text functionality below

    if CTResponses[cleanMsg]:
        # If dad has a phrase stored within his alias library, use it
        await message.channel.send(CTResponses[cleanMsg])
        return

    if cleanMsg.startswith(("i'm ", "im ", "i am ", "i m ")):
        # dad joke (snip 3)
        return
    elif cleanMsg.startswith(("i m ", "i'm ")):
        # dad joke (snip 4)
        return
    elif cleanMsg.startswith("i am "):
        # dad joke (snip 5)
        return

    # End plain text functionality

    if not cleanMsg.startswith(config.prefix): # if the message doesn't contain a command, our work here is done
        return

    with cleanMsg.split(" ") as splitty:
        command = splitty[1]
        args = splitty[2:].join(" ").split("\"")
        if len(args) == 1: # if no speech marks are used, split by spaces instead
            args = splitty[2:]
        else: # if speech marks are used, remove all whitespace args
            for arg in args:
                if arg == " " or arg == "":
                    args.remove(arg)

    # Commands below

    if perms[message.author.id] >= 1:
        # Tier 1 commands here
        if command == "rgb" and len(args) == 3:
            await message.channel.send(describeColour(args))
            return

    if perms[message.author.id] >= 2:
        # Tier 2 commands here
        if command == "alias" and len(args) == 2:
            if await alias(message.content[len(config[prefix]) + 5:]):
                await message.channel.send("New hip and trendy phrase acquired. Watch out kiddos.")
                return
            else:
                await message.channel.send("I don't think you formatted that quite right I'm afraid.")
                return

    if perms[message.author.id] >= 3:
        # Tier 3 commands here
        pass

    if perms[message.author.id] >= 4:
        # Moderator commands here
        if command == "setgame":
            await setGame(message.content[len(config[prefix] + 1) + 1])
            await message.channel.send("Game set.")
            return

        if command == "aliaslist":
            await sendAliasList(CTResponses, message.author.id)
            await message.channel.send("DM sent 😉")
            return

        if command == "updateperms" or command == "permupdate":
            perms = await updatePerms()
            await message.channel.send("Perms updated. Dad's got you covered.")
            return

    if perms[message.author.id] >= 5:
        # Developer commands here
        pass

async def describeColour(args):
    """
    Function
    Describes a colour to the user based on a given RGB value

    Usage: rgb [red value] [green value] [blue value]
    Parameters: args (RGB values in an list/tuple)
    Returns: message to send (string)
    """

    try:
        rgb = (float(args[0]) // 85, float(args[1]) // 85, float(args[2]) // 85)
    except ValueError:
        return "It'd be nice if you used numbers son."

    output = "Good question son!.\nAs you can clearly see, "

    if rgb[0] == 0:
        output += "there isn't a lot of red, "
    elif rgb == 1:
        output += "you've got some red in there, "
    elif rgb >= 2:
        output += "you've got a healthy dollop of red, "

    if rgb[1] == 0:
        output += "not much green, "
    elif rgb[1] == 1:
        output += "you've got some green, "
    elif rgb[1] >= 2:
        output += "a strong dollop of Shrek in the mix, "

    if rgb[2] == 0:
        output += "and that's about it to be honest."
    elif rgb[2] == 1:
        output += "and a splotch of blue to round it all off."
    elif rgb[2] >= 2:
        output += "and holy cow this is my jam!\n*I'm blue da ba dee da ba daa*\n*Da ba dee da ba daa, da ba dee da ba daa, da ba dee da ba daa*\n*Da ba dee da ba daa, da ba dee da ba daa, da ba dee da ba daa*"
        return output

    output += "\nI hope that helped you come to terms with that colour you just gave me. I've basically inherited the abilities of one of my many sons, Mallen."
    return output

async def alias(message):
    """
    Function
    Creates an alias so that dad will respond to one phrase with another

    Usage: alias "[string of words to trigger]" "[string of words as response]"
    Parameters: message (string of message sent, snipped of the command call)
    Returns: True if successful, False otherwise
    """

    phrases = message.split("\"")
    try:
        phrases.remove("")
        phrases.remove(" ")
        phrases.remove("")
    except ValueError:
        return False

    CTResponses[phrases[0].lower()] = phrases[1]
    saveJSON(CTResponses, "cleanTextResponses", True)
    return True

async def setGame(setTo):
    """
    Procedure
    Sets the game to the passed string and saves the changes to the bot's config files

    Usage: setgame [game]
    Parameters: setTo (string used as game name)
    """

    config[game] = setTo
    client.change_presence(game = discord.Game(name = setTo))
    saveJSON(config, "config")

async def sendAliasList(d, recipient):
    """
    Procedure
    Sends the caller a DM with all current aliases in it

    Usage: aliaslist
    """

    stringOfDict = json.dumps(d, separators=(',',':'))
    pretty = stringOfDict.replace(",", "\n").replace(":"," -> ").replace("{","").replace("}","")
    await message.recipient.send("**Current aliases are:**\n\n{0}\n\n*Please do not share this around, it will result in swift removal of both your message and ability to use this command.*".format(pretty))

async def updatePerms(guild):
    """
    Function
    Updates permissions dictionary and respective .json file

    Usage: updateperms || permupdate
    Returns: permissions dictionary
    """

    notPermLevels = {}

    for member in guild.members:
        if member.bot:
            notPermLevels[member.id] = 0
        elif config[ownerID] == member.id:
            notPermLevels[member.id] = 6
        elif config[devs] in member.roles:
            notPermLevels[member.id] = 5
        elif config[mods] in member.roles:
            notPermLevels[member.id] = 4
        elif config[tier3] in member.roles:
            notPermLevels[member.id] = 3
        elif config[tier2] in member.roles:
            notPermLevels[member.id] = 2
        elif config[tier1] in member.roles:
            notPermLevels[member.id] = 1
        else:
            notPermLevels[member.id] = 0

    saveJSON(notPermLevels, "permLevels", True)
    return notPermLevels

def saveJSON(data, fileName = "data", sort = False):
    """
    Procedure
    Parameters: data (variable to save), fileName (name to give file, without prefix), sort (bool as to whether or not the data should be sorted)
    Saves a JSON file of given data
    """

    outFile = open(fileName + ".json", "w")
    json.dump(data, outFile, sort_keys = sort, indent = 4)
    outFile.close()

client.run(config["token"])
