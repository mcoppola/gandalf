var	request = require('request'),
	async = require('async');

var util = {};


util.parseCommandFromMessage = function(text, modId, trigger) {
	var cmd;

	if (text.indexOf(trigger) >= 0 ) {
		cmd = text.indexOf(trigger) == 0 ? text.split(trigger, + ' ').pop() : text.split(' ' +trigger)[0]
	} else if (text.indexOf(modId) >= 0) {
		cmd = text.indexOf(modId) == 0 ? text.split(': ').pop() : text.split(' ' + modId)[0];
	}

	return cmd;
}

util.getDMChannelFromUser = function(userId, token, callback) {

	request.get({ 
		uri: 'https://slack.com/api/im.open',
		qs: {
			token: token,
			user: userId
		}
	}, function(e, res){
		return callback(e, JSON.parse(res.body).channel.id);
	});
}

util.getDMChannels = function(userIds, token, callback) {

	var dmChannels = {}
	async.each(userIds, function(id, callback) {
		this.getDMChanellFromUser( id, token, function(dmId) {
			dmChannels[id] = dmId;
			return callback(null)
		});	
	}, function(err){
		if (err) return callback(err);
		return callback(null, dmChannels);
	});
}

util.getUsersInChannel = function(channel) {
	var self = this;

	if (channel.is_im) return [{ id: channel.user , user: self.slack.getUserByID(channel.user), name: channel.name }];

	var users = [];
	for (var i = channel.members.length - 1; i >= 0; i--) {
		users.push({ id: channel.members[i], name: self.slack.getUserByID(channel.members[i]).name, user: self.slack.getUserByID(channel.members[i])})
	};
	return users;
}	

util.pickRandomProperty = function(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

module.exports = util;