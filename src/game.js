function Game(options) {
	var self = this;

	self.title = options.title;
	self.time = formatTime(options.time);
	self.day = options.day || 'today';
	self.players = [];

}
Game.prototype.addPlayer = function(user, avatar) {
	var self = this;
	self.players.push({user: user, avatar: avatar});
};
Game.prototype.removePlayer = function(user) {
	var self = this;
	if (self.players.indexOf(user) > -1) {
		self.players.splice(self.players.indexOf(user), 1);
	}
};
Game.prototype.endGame = function(user) {
	var self = this;
	if (self.players.indexOf(user) > -1) {
		self.players.splice(self.players.indexOf(user), 1);
	}
};

Game.prototype.printStatus = function() {
	var self = this;

	// info
	var s = ':game_die: *' + self.title + '* ' + ':clock' + self.time + ': _today_ ~';

	// players
	for (var i = 0; i < Object.keys(self.players).length; i++) {
		s += ' ' + self.players[Object.keys(self.players)[i]].avatar + self.players[Object.keys(self.players)[i]].user;
	};
	return s;
};

function formatTime(s) {
	if (s === undefined) {return ''; }
	if (s.indexOf('00') > -1 ) {
		s = s.slice(0, s.indexOf('00')) + s.slice(s.indexOf('00') + 2, s.length);
	}
	s = s.toString().replace( /\D+/g, '');

	return s;
}

module.exports = Game;