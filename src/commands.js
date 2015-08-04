module.exports = {

	hello: function(bot, command) {
		bot.say('hello ' + command.user, command.channel);
	},
	help: function(bot, command) {

		var helpText = {
			'help': ' _Lists commands._',
			'new game': ' <title> <time> _Starts a new game event._',
			'join game': ' <title> _Join an existing game._',
			'end game': ' <title> _End an existing game and pick a winner if it was completed._',
			'leave game': ' <title> _Leave an existing game._',
			'set avatar': ' <emoji> _Set an emoji for your avatar._',
			'avatar': ' _Show your avatar._',
			'list games': ' _Lists all current games._'
		};

		bot.help(command, helpText);
	},
	"new game": function(bot, command) {
		bot.newGame(command);
	},
	"join game": function(bot, command) {
		bot.joinGame(command);
	},
	"leave game": function(bot, command) {
		bot.leaveGame(command);
	},
	"end game": function(bot, command) {
		bot.endGame(command);
	},
	"list games": function(bot, command) {
		bot.listGames(command);
	},
	"set avatar": function(bot, command) {
		bot.setAvatar(command);
	},
	"avatar": function(bot, command) {
		bot.showAvatar(command);
	}
};