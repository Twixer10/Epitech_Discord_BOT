const Discord = require('discord.js');
const { prefix, channels } = require("../config.json");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const main = require("../bot");
var url = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXC'est non!"
const db = require("../data/function_db");

var activities = getActivities();

/** This function it's used to generate the Activities Embed
 * @param {Object} obj This is the variable which store activities
 * @param {Discord.Message} message This is the message that contains a command
 * @return {Discord.MessageEmbed} The generated embed
 */
function listActivitiesEmbed(obj, message) {
    var i = 0;
    var list = null;
    if (!obj || obj == null) {
        return ("There are no activities today...");
    }
    const actvt = new Discord.MessageEmbed()
	.setColor('#0300ff')
	.setTitle('List of all activities of today')
	.setAuthor(message.author.username, message.author.avatarURL())
	.setDescription("To initialize a presence made this command : \n**" + prefix + "activity start <index> **\n\n ㅤ")
	.setThumbnail(message.guild.iconURL())
	.setTimestamp()
	.setFooter('Don\'t spam !', message.guild.iconURL());
    obj.forEach(element => {
        i++;
        actvt.addFields(
            { name: i + ") " + element.acti_title , value: "Time : *[" + element.start.split(" ")[1].substring(0, element.start.split(" ")[1].length - 3) + " - " + element.end.split(" ")[1].substring(0, element.start.split(" ")[1].length - 3) + "]*",  inline: false },
        );
    });
    return (actvt);
}

/** This function it's used to get a request
 * @return {String} Get the resquest
 */
function httpGet(url) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", url, false);
    xmlhttp.send(null);
    return xmlhttp.responseText;
}

/** This function it's used to determine if the activity can be loaded
 * @return {Object} The activity
 */
function getActivities() {
    var today = new Date();
    var t = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + (today.getDate());
    var url_activities = url + "planning/load/?format=json";
    var response = httpGet(url_activities + "&start=" + t + "&end=" + t);

    var obj = JSON.parse(response)
    return ((Object.keys(obj).length < 1?null:obj));
}

/** This function it's used to determine if the activity can be loaded
 * @param {Discord.Message} message This is the message that contains a command
 * @param {Interger} i The id of the activity
 * @return {Boolean} Is load or not
 */
function load(message, i) {
    activities = getActivities();
    if (activities == null || activities.lenght == 0) {
        //message.reply("Error in request activities, try again in few seconds.");
        return false;
    }
    if (i !== 1)
        message.reply("activity: load: The day's activities successfully loaded.");
    return true;
}

/** This function it's used to list activities
 * @param {Discord.Message} message This is the message that contains a command
 * @param {Array<string>} args The content of the message parser in an array with spaces separator
 */
function list(message) {
    if (message.channel.id === channels.command.channel_command_pedago_id) {
        message.reply("*Please wait, retrieving from the intranet API*").then(msg => {
            load(message, 1);
            var list_activities = listActivitiesEmbed(activities, message);

            message.reply(list_activities);
            msg.delete();
        });
    } else {
        message.reply("This command can be executed only in <#" + channels.command.channel_command_pedago_id + ">")
    }
}

/** This function it's used to start an activity
 * @param {Discord.Message} message This is the message that contains a command
 * @param {Array<string>} args The content of the message parser in an array with spaces separator
 */
async function start(message, args) {
    if (message.channel.id === channels.command.channel_command_pedago_id) {
        if (activities == null) {
            message.reply("Error, please use `!activity list` first !");
        }
        if (args.length === 3) {
            if (args[2] === "0") {
                message.reply("Error : Index start by 1.");
                return;
            }
            if (parseInt(args[2])) {

                let index = parseInt(args[2], 10);
                if (index > activities.length) {
                    message.reply("This activity dosnt exist.");
                    return;
                }
                let current = activities[index - 1];

                db.create_activity(current.acti_title, current.total_students_registered, (err, id) => {
                    if (!err) {
                        message.reply("ERROR : SQLITE ERROR");
                        console.log(id);
                        return;
                    }
                    message.guild.channels.create(id + "-" + "act-" + index + "-" + activities[index-1].acti_title, {
                        type: "text", //This create a text channel, you can make a voice one too, by changing "text" to "voice"
                        parent: channels.activities.category_id,
                        permissionOverwrites: [
                            {
                            id: message.guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
                            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] //Deny permissions
                            },
                            {
                            id: message.author.id,
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                            }
                        ],
                    }).then(ch => {ch.send(`${message.author} your channel is here !`)});
                });
            } else {
                message.reply("Error : `" + args[2] + "` is not a number.");
            }
        } else {
            message.reply("Error, syntax : !activity start <int>");
        }
    } else {
        message.reply("This command can be executed only in <#" + channels.command.channel_command_pedago_id + ">")
    }
}

/**
 * This function it's used for set the presence to true in the database
 * @param {Object} obj This is the object where is all activities
 * @return {Integer} The length of activitites
 */
function lengthActivities(obj) {
    i = 0;

    if (!obj)
        return (0);
    obj.filter(element => {
        i++;
    });
    return (i);
}

/** 
 * This function it's used for get all students in an activity
 * @param {JSON.parse} obj This is a json variable who contain all activity of the day
 * @param {Array<string>} index This is the index of an activity in the list of all activities of the day
 * @return {JSON.parse} The list of student
 */
function getRegisteredByActivities(obj, index) {
    var i = 0;
    var c = 0

    if (index > lengthActivities(obj)) {
        return (null);
    }
    var choose = obj.filter(function(item){
        if (++i == index) {
            c = i;
            return (item);
        }
    });
    var url_register;
    choose.forEach(element => {
        var url_module = "module/" + element.scolaryear + "/" + element.codemodule + "/" + element.codeinstance + "/" + element.codeacti + "/" + element.codeevent + "/registered/?format=json";
        url_register = url + url_module;
    });
    var response = httpGet(url_register);
    return (JSON.parse(response));
}

/** 
 * This function it's used for set the presence to true in the database
 * @param {Discord.Message} message This is the message that contains a command
 * @param {Array<string>} args The content of the message parser in an array with spaces separator
 */
function presence(message, args) {
    if (!args[2]) {
        if (message.channel.parent.id !== channels.activities.category_id) {
            message.reply("This command can be executed only in channel of category <#" + channels.activities.category_id + ">");
            return;
        }
        message.reply("Parssing error.").then(msg => {msg.delete({timeout:5000})});
        return;
    }
    if (args[2] === "start" && args.length === 3) {
        if (message.channel.parent.id !== channels.activities.category_id) {
            message.reply("This command can be executed only in channel of category <#" + channels.activities.category_id + ">");
            return;
        }
        db.startPresence(message.channel.name.split("-")[0], (err, msg) => {
            if (!err) {
                message.reply("ERROR : SQLITE");
                console.log(msg);
            }
            message.channel.send("The presences have just started, place the command **__" + prefix + "present__** to confirm your presence !")
        });
    } else if (args[2] === "stop" && args.length === 3) {
        if (message.channel.parent.id !== channels.activities.category_id) {
            message.reply("This command can be executed only in channel of category <#" + channels.activities.category_id + ">");
            return;
        }
        db.stopPresence(message.channel.name.split("-")[0], (err, msg) => {
            if (!err) {
                message.reply("ERROR : SQLITE");
                console.log(msg);
            }
            message.channel.send("**Presence is closed**")
        });
    } else if (args[2] === "all" && args.length === 3) {
        if (message.channel.id !== channels.command.channel_command_pedago_id) {
            message.reply("This command can be executed only in channel of category <#" + channels.command.channel_command_pedago_id + ">");
            return;
        }
        const allact = new Discord.MessageEmbed()
            .setColor('#0300ff')
            .setTitle('List of all activities in the database')
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription("To generat a presence file made this command : \n**" + prefix + "activity presence get <index> **\n\n")
            .setThumbnail(message.guild.iconURL())
            .setTimestamp()
            .setFooter('Don\'t spam !', message.guild.iconURL());
        db.getAllActivityPresence((err, row) => {
            if (!err) {
                message.reply("ERROR : SQLITE getAllActivityPresence");
                console.log(msg);
            }
            if (row === undefined) {
                message.reply("*database is empty*");
                return;
            }
            row.forEach(val => {
                allact.addFields(
                    { name: val.id + ") " + val.title , value: "Date : *[" + val.current_date.split(" ")[2] + " " + val.current_date.split(" ")[1] + " " + val.current_date.split(" ")[3] + "]*",  inline: false },
                );
           });
            message.reply(allact);
        });
    } else if (args[2] === "get" && args.length === 4) {
        if (message.channel.id !== channels.command.channel_command_pedago_id) {
            message.reply("This command can be executed only in channel of category <#" + channels.command.channel_command_pedago_id + ">");
            return;
        }
        if (parseInt(args[3])) {
            var indx = parseInt(args[3]);
        } else {
            message.reply("Error : `" + args[3] + "` is not a number.");
            return;
        }
        message.reply("*The file is being generated, please wait ...*").then(msg => {
            var indx = parseInt(args[3]);
            var tot = 0;
            db.getPresence(indx, (err, row) => {
                if (!err) {
                    message.reply("ERROR : SQLITE getPresence");
                    console.log(msg);
                    return;
                }
                if (row === undefined) {
                    message.reply("*Nobody is register for this activity or this activity dosnt exist*");
                    return;
                }
                let Readable = require('stream').Readable
                var str = "login;present\n";
                let buffer = new Readable();
                buffer.push(str);
                row.forEach(rep => {
                    tot++;
                    buffer.push(rep.email + ";" + rep.status + "\n");
                    if (tot === row.length) {
                        msg.delete();
                        buffer.push(null);
                        db.getActivityTitle(indx, (err, title) => {
                            if (!err) {
                                message.reply("ERROR : SQLITE getActivityTitle");
                                console.log(msg);
                                return;
                            }
                            main.client.channels.cache.forEach(r => {
                                if (r.id === channels.activities.file_channel_id)
                                    if (title === "nothing") {
                                        r.send(new Discord.MessageAttachment(buffer, 'presence.csv'));
                                        r.send(`${message.author} your file is here !`);
                                    } else {
                                        r.send(new Discord.MessageAttachment(buffer, title + '.csv'));
                                        r.send(`${message.author} your file is here !`);
                                    }
                            });
                        });
                    }
                });
            });
        });
    } else {
        message.reply("Parssing error.").then(msg => {msg.delete({timeout:5000})});
        return;
    }
}

/** 
 * This is the function who initialize the list of activity of the day 
 * @param {Discord.Message} message This is the message that contains a command
 */
function init(message) {
    if (message.channel.parent.id != channels.activities.category_id) {
        message.reply(`This command must be executed in the channel of the category **__<#${channels.activities.category_id}>__**`);
        return;
    }
    message.reply("Channel initialization in progress ....").then(msg => {
        var list = getRegisteredByActivities(activities, message.channel.name.split("-")[2]);
        var tot = lengthActivities(list);
        var max = 0;
        var added = 0;
        list.forEach(s => {
            db.get_user_id(s.login, (err, discordID) => {
                max++;
                if (err) {
                    added++;
                    db.initPresence(s.login, message.channel.name.split("-")[0], (err, rep) => {
                        if (!err) {
                            message.reply("ERROR : SQLITE initPresence");
                            console.error(rep);
                            return;
                        }
                    });
                    main.client.users.fetch(discordID).then((user) => {
                        message.channel.updateOverwrite(user.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true, READ_MESSAGE_HISTORY: true});
                    });
                } else {
                    message.channel.send(`${s.login} is not in the database !`)
                }
                if (max == tot) {
                    msg.delete();
                    message.channel.send(`Initialization completed, there are ${added}/${max} students added to the channel !`)
                }
            });
        });
    });
}

/** 
 * This is the function to show help message
 * @param {Discord.Message} message This is the message that contains a command
 */
function help(message) {
    const allact = new Discord.MessageEmbed()
        .setColor('#3bf646')
        .setTitle('Help : All Commands of Activity')
        .setAuthor(message.author.username, message.author.avatarURL())
        .setDescription("Below all the commands associated with the presence command\n\n")
        .setThumbnail(main.client.user.avatarURL())
        .setTimestamp()
        .setFooter('Don\'t spam !', message.guild.iconURL())
        .addFields({ name: prefix + "activity list", value: "This command allows you to list all the activities of the day, it can be executed only in the channel <#" + channels.activities.channel_command_id + ">",  inline: false })
        .addFields({ name: prefix + "activity start <index>", value: "This command allows you to start an activity, it can be executed only in the channel <#" + channels.activities.channel_command_id + ">",  inline: false })
        .addFields({ name: prefix + "activity stop", value: "This command allows you to delete the textual channel of an activity without affecting the database, it can be executed only in the channel who is in category <#" + channels.activities.category_id + ">",  inline: false })
        .addFields({ name: prefix + "activity init", value: "This command allows you to initializes an activity by adding the students associated with the activity, it can be executed only in the channel who is in category <#" + channels.activities.category_id + ">",  inline: false })
        .addFields({ name: prefix + "activity presence <start / stop>", value: "This command allows you to start or stop presence for a specific activity, it can be executed only in the channel who is in category <#" + channels.activities.category_id + ">",  inline: false })
        .addFields({ name: prefix + "activity presence all", value: "This command allows you to list all activities who is in the database, it can be executed only in the channel <#" + channels.activities.channel_command_id + ">",  inline: false })
        .addFields({ name: prefix + "activity presence get <index>", value: "This command allows you to generate a presence file from the database, it can be executed only in the channel <#" + channels.activities.channel_command_id + ">",  inline: false })
        .addFields({ name: prefix + "activity help", value: "This command shows you this message, it can be executed everywhere",  inline: false });
    message.reply(allact);
}

/** 
 * This is the function to stop an activity
 * @param {Discord.Message} message This is the message that contains a command
 */
function stop_activity(message) {
    if (message.channel.parent.id !== channels.activities.category_id) {
        message.reply("This command can be executed only in channel of category <#" + channels.activities.category_id + ">");
    } else {
        message.channel.delete();
    }
}

/** @module command/activity */
module.exports = {
    /** This parameter defines the name of the command and the name of the command itself
     * @type {string}
     */
    name: "activity",
    /** This is the description of the command
     * @type {string}
     */
    description: "Main command to manage presence.",
    /**
     * The list of roles in a table
     * @type {Array<string>}
     */
    authorized_role: ["Discord Dev", "Adm", "AER"],
    /** This boolean is for activate or desactivate the command
     * @type {boolean}
     */
    enable: true,
    /** This is where the code has to be executed for each command that takes place
     * @param {Discord.Message} message This is the message that contains a command
     * @param {Array<string>} args The content of the message parser in an array with spaces separator
     * @static
     */
    execute(message, args) {
        if (args.lenght < 2) {
            message.reply("Error in parsing command.");
            return;
        }
        if (args[1] == "list") {
            list(message, 0);
            return;
        }
        if (args[1] == "init") {
            init(message);
            return;
        }
        if (args[1] == "start") {
            start(message, args);
            return;
        }
        if (args[1] == "presence") {
            presence(message, args);
            return;
        }
        if (args[1] == "stop") {
            stop_activity(message);
            return;
        }
        if (args[1] == "help") {
            help(message);
            return;
        }
        message.reply("Error in parsing command.");
    }
}