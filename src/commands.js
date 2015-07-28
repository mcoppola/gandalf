module.exports = {

	hello: function(bot, command) {
		bot.say('hello ' + command.user, command.channel);
	},
	help: function(ww, command) {
		bot.help(command);
	}
}