var extend = require('util')._extend;
	_ = require('lodash'),
	commands = _.keys(require('./commands'));


function cmd (options) {
	var self = this;

	self = extend(self, options);
	self.parseTrigger(self.message);
}

cmd.prototype.parseTrigger = function(message) {
	var self = this;
	var split = message.split(' ');
	var s = '';

	for (var i = 0; i < split.length; i++) {
		s += (i==0 ? '' : ' ') + split[i];
		if (_.includes(commands, s)) {
			self.trigger = s;
			self.parseArgs(self.trigger);
			break;
		}
	}
};

cmd.prototype.parseArgs = function(cmd) {
	var self = this;

	// no command found
	if (self.message.indexOf(cmd) < 0) return false;
	// no args found
	if (self.message.split(cmd + ' ').length <= 1) return false;

	var args = self.message.split(cmd + ' ').pop().split(' ');

	var joinedArgs = [];
	var inString = false;

	for (var i = 0; i < args.length; i++) {
		if(args[i].indexOf('"') >= 0) {
			if (inString) {
				joinedArgs[joinedArgs.length - 1] += ' ' + args[i].substr(0, args[i].indexOf('"'));
				inString = false;
			} else {
				joinedArgs.push(args[i].substr(1, args[i].length));
				inString = true;
				if (joinedArgs[joinedArgs.length - 1].indexOf('"') >= 0) {
					args.push(joinedArgs[joinedArgs.length - 1].split('"')[1]);
					joinedArgs[joinedArgs.length - 1] = joinedArgs[joinedArgs.length - 1].split('"')[0];
					instring = false;
				}
			}
		} else {
			if (inString) {
				joinedArgs[joinedArgs.length - 1] += ' ' + args[i];
			} else {
				joinedArgs.push(args[i]);
			}
		}		
	};

	self.args = joinedArgs;
};

module.exports = cmd;