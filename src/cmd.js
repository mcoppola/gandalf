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

}

cmd.prototype.parseArgs = function(cmd) {
	var self = this;

	if (self.message.indexOf(cmd) < 0) return false;

	self.args = self.message.split(cmd + ' ').pop().split(' ');
}

module.exports = cmd;