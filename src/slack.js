var Slack = require('slack-client');
	
var token = 'xoxb-8284658500-8yRYnFJ9QX0bzKrhFSJhh56B',
    autoReconnect = true,
    autoMark = true;
    

var slack = new Slack(token, autoReconnect, autoMark);


slack.on('open', function() {

	var channels = [],
	    groups = [],
	    unreads = slack.getUnreadCount(),
	    key;

	for (key in slack.channels) {
		if (slack.channels[key].is_member) {
			channels.push('#' + slack.channels[key].name);
		}
	}

	for (key in slack.groups) {
		if (slack.groups[key].is_open && !slack.groups[key].is_archived) {
			groups.push(slack.groups[key].name);
		}
	}

	console.log('Bot is running...');
});


slack.on('error', function(error) {
	console.error('Error: %s', error);
});


slack.login();
module.exports = slack;