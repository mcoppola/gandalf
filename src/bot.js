var slack = require('./slack'),
	Message = require('../node_modules/slack-client/src/message'),
	request = require('request'),
	util = require('./util'),
	commands = require('./commands'),
	_ = require('lodash');
	util.slack = slack;


function Bot () {
	var self = this;

	self.botId = 'bot';        // slack bot id - get from a ping 
	self.trigger = 'ALT_BOT_TRIGGER';  // alternate command trigger to @<bot_name>
	self.slackChannel = 'test';

	self.listen();
}

Bot.prototype.command = function(options) {
	var self = this;
	var command = new cmd(options);

	if (commands[command.trigger]) {
		commands[command.trigger](self, command);
	} else {
		self.say("I'm just a robot. I don't understand. Try '" + self.trigger + "'' help'.", command.channel);
	}
};

// Slack listener
Bot.prototype.listen = function() {
	var self = this;

	slack.on('message', function(message) {

		console.log(message);

		var type = message.type,
		    channel = slack.getChannelGroupOrDMByID(message.channel),
		    user = slack.getUserByID(message.user),
		    name = user = slack.getUserByID(message.user),
		    time = message.ts,
		    text = message.text || '';

		// Pinged?		
		if (type === 'message' && (text.indexOf(self.botId) >= 0)) {

			// set to current channel
			self.slackChannel = channel;

			self.command(text.indexOf(self.botId) == 0 ? text.split(': ').pop() : text.split(' ' + self.botId)[0], user.name);
		}

	});

};

Bot.prototype.say = function(message) {
	var self = this;

	var m = new Message(self.slackChannel._client, { channel: self.slackChannel.id, text: message});
	self.slackChannel._client._send(m);
};

Bot.prototype.help = function(sourceCmd) {
	var self = this;

	self.say('*Commands:*', sourceCmd.channel);
	var list = _.keys(commands);
	for (var i = list.length - 1; i >= 0; i--) {
	 	self.say(list[i], sourceCmd.channel);
	 }; 
}


module.exports = new Bot();