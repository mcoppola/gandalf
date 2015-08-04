var slack = require('./slack'),
	Message = require('../node_modules/slack-client/src/message'),
	request = require('request'),
	util = require('./util'),
	cmd = require('./cmd'),
	commands = require('./commands'),
	_ = require('lodash');
	util.slack = slack,
	mongojs = require('mongojs');

var	Game = require('./game');


function Bot () {
	var self = this;

	self.botId = '<@U088CKCEQ>';        // slack bot id - get from a ping 
	self.trigger = 'moon';               // alternate command trigger to @<bot_name>
	self.slackChannel = 'test';

	self.currentGames = [];

	// db init
	self.db = mongojs('localhost:27017/gandalf');

	self.listen();
}

// ------------------------------------------------------ //
// BASIC FN's 
// ------------------------------------------------------ //

Bot.prototype.command = function(options) {
	var self = this
	var command = new cmd(options);

	if (commands[command.trigger]) {
		commands[command.trigger](self, command);
	} else {
		// self.say("I'm just a robot. I don't understand. Try '" + self.trigger + "'' help'.", command.channel);
	}

	if (self.waitingForResponse && _.includes(self.responseCandiates, command.user)) {
		self.responseFn(command);
	}
}

// Slack listener
Bot.prototype.listen = function() {
	var self = this;

	slack.on('message', function(message) {


		var type = message.type,
		    channel = slack.getChannelGroupOrDMByID(message.channel),
		    user = slack.getUserByID(message.user),
		    name = user = slack.getUserByID(message.user),
		    time = message.ts,
		    text = message.text || '';


		// Engine room? don't respond
		if (channel.id !== 'C0258NDNK') {

			// Pinged?		
			if (type === 'message' && channel.name !== 'engine-room' && ((text.indexOf(self.botId) >= 0) || (text.indexOf(self.trigger) >= 0))) {

				// set to current channel
				self.slackChannel = channel;

				self.command({message: util.parseCommandFromMessage(text, self.botId, self.trigger), user: user.name, channel: channel});
			}
		}

	});

};

Bot.prototype.say = function(message, channel) {
	var self = this;

	if (channel === undefined) { 
		return console.log('ERROR say() called without channel provided. message: ', message);
	}

	var m = new Message(channel._client, { channel: channel.id, text: message});
	channel._client._send(m);
};

Bot.prototype.help = function(sourceCmd, helpText) {
	var self = this;

	// self.say('-- _use "bot" or @bot and these commands', sourceCmd.channel);
	var list = _.keys(commands);
	for (var i = list.length - 1; i >= 0; i--) {
		self.say("*" + list[i] + "*" + (helpText[list[i]] || ''), sourceCmd.channel);
	}; 
};


// ------------------------------------------------------ //
// GAME 
// ------------------------------------------------------ //


Bot.prototype.newGame = function(sourceCmd) {
	var self = this;

	// start a new game

	// args = [ title, time, day ]

	if (!sourceCmd.args || !sourceCmd.args[0] || !sourceCmd.args[1]) {
		return self.say("Please provide a <title> and a <time>!", sourceCmd.channel);
	}

	var game = new Game({ title: sourceCmd.args[0], time: sourceCmd.args[1] });

	self.db.collection('players').find({ title: sourceCmd.user }, function(err, results){
		if (err) console.log('err', err);

		if (results.length) {
			game.addPlayer(sourceCmd.user, results[0].avatar || '');
			self.say(game.printStatus(), sourceCmd.channel);
		} else {
			self.db.collection('players').save({ title: sourceCmd.title });
			game.addPlayer(sourceCmd.user, '');
			self.say(game.printStatus(), sourceCmd.channel);
		}

		self.currentGames.push(game)

	});
};

Bot.prototype.joinGame = function(sourceCmd) {
	var self = this;

	// join and existing game
	// args = [ title ]

	var title = sourceCmd.args[0],
		foundGame = false;

	var game = new Game({ title: sourceCmd.args[0], time: sourceCmd.args[1] });

	if (game) {
		self.db.collection('players').find({ title: sourceCmd.user }, function(err, results){
			if (err) console.log('err: ', err);

			if (results.length) {
				game.addPlayer(sourceCmd.user, results[0].avatar || '');
				self.say(game.printStatus(), sourceCmd.channel);
			} else {
				self.db.collection('players').save({ title: sourceCmd.title });
				game.addPlayer(sourceCmd.user, '');
				self.say(game.printStatus(), sourceCmd.channel);
			}
		});
	} else {
		self.say("I couldn't find that game. Please check the title.", sourceCmd.channel);
	}
};

Bot.prototype.leaveGame = function(sourceCmd) {
	var self = this;

	// leave an existing game
	// args = [ title ]

	var title = sourceCmd.args[0];
	var game = self.findGameByTitle(title);

	if (!game) {
		self.say("I couldn't find that game. Please check the title.", sourceCmd.channel);
	} else {
		game.removePlayer(sourceCmd.user);
		self.say(game.printStatus(), sourceCmd.channel);
	}
};

Bot.prototype.endGame = function(sourceCmd) {
	var self = this;

	// leave an existing game
	// args = [ title ]

	var title = sourceCmd.args[0],
		foundGame = false;

	var game = self.findGameByTitle(title);

	if (!game) {
		self.say("I couldn't find that game. Please check the title.", sourceCmd.channel);
	} else {

		self.currentGames.splic(self.currentGames.indexOf(game), 1);
		self.say(game.title + ' ended.', sourceCmd.channel);

		// self.say('Who won?', sourceCmd.channel);
		// self.waitingForResponse = true;
		// self.responseCandiates = game.players;
		// self.responseFn = function(command) {
		// 	if (_.includes(command.args[0])
		// }
		// self.currentGames.slice(self.currentGames.indexOf(game), 1);
	}
};

Bot.prototype.listGames = function(sourceCmd) {
	var self = this;

	for (var i = 0; i < self.currentGames.length; i++) {
		self.say(self.currentGames[i].printStatus(), sourceCmd.channel);
	};
};

Bot.prototype.findGameByTitle = function(title) {
	var self = this;

	var foundGame = false,
		game;

	for (var i = 0; i < self.currentGames.length; i++) {
		if(self.currentGames[i].title == title) {
			game = self.currentGames[i];
			foundGame = true;
		}
	};

	return foundGame ? game : false;
};



// ------------------------------------------------------ //
// USER
// ------------------------------------------------------ //


Bot.prototype.setAvatar = function(sourceCmd) {
	var self = this;

	if (!sourceCmd.args || !sourceCmd.args[0]) {
		return self.say('Please provide an <emoji> to set as your avatar.', sourceCmd.channel);
	}

	var avatar = sourceCmd.args[0];

	if (avatar.indexOf(':') < 0) {
		return self.say('Please provide an <emoji> to set as your avatar. Include both ":".', sourceCmd.channel);
	}

	// save
	self.db.collection('players').find({title: sourceCmd.user }, function(err, results){
		if (err) throw err;

		if (results.length) {
			self.db.collection('players').update({ title: results[0].title }, { $set: { avatar: avatar } });
		} else {
			self.db.collection('players').save({ title: sourceCmd.user, avatar: avatar })
		}
	});


	for (var i = 0; i < self.currentGames.length; i++) {
		if( _.contains(Object.keys(self.currentGames[i].players), sourceCmd.user)) {
			self.currentGames[i].players[self.currentGames[i.players.indexOf(sourceCmd.user)]].avatar = avatar;
		}
	};

	self.say('Avatar set!', sourceCmd.channel);

};

Bot.prototype.showAvatar = function(sourceCmd) {
	var self = this;

	self.db.collection('players').find({ title: sourceCmd.user }, function(err, results){
		if (err) console.log('err', err);

		var avatar;

		if (results.length) {
			avatar = results[0].avatar;
		}

		if (avatar.length) {
			self.say(avatar + sourceCmd.user, sourceCmd.channel);
		} else {
			self.say('No avatar set.  Use *set avatar* <emoji> to set it.', sourceCmd.channel);
		}

	});
};


// ------------------------------------------------------ //
// DB
// ------------------------------------------------------ //

Bot.prototype.savePlayer = function(player, avatar) {
	var self = this;
	self.db.collection('players').save({ title: player, avatar: avatar });
};

Bot.prototype.saveGame = function(game) {
	var self = this;
	self.db.collection('games').save({ title: game.title, players: game.players.toString(), time: game.time });
};

module.exports = new Bot();