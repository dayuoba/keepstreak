var defaultconfig = require('../config/config.json');
var Schedule = require('node-schedule');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var rootdir = require('rootdir');

var COMMANDS = {
	GITADD: 'git add --all',
	GITCOMMIT: 'git commit -m "' + new Date() + '"',
	GITPUSH: 'git push auto master',
	GITREMOTEADD: 'git remote add auto ',
	GITREMOTEREMOVE: 'git remote remove auto '

};

function gitAddRemote(addr, cb) {
	var cb = cb || function() {};
	exec(COMMANDS.GITREMOTEADD + addr, function(err, stdout, stderr) {
		if (err) throw new Error(err);
		if (stderr) throw new Error(stderr.toString());
		cb(stdout);
	})
}

function gitRmRemote(cb) {
	var cb = cb || function() {};
	exec(COMMANDS.GITREMOTEREMOVE, function(err, stdout, stderr) {
		if (err || stderr)
			console.log('There appears not to be a remote named auto,trying creating');
		cb();
	})
}

function gitAddFile(cb) {
	var cb = cb || function() {};
	exec(COMMANDS.GITADD, function(err, stdout, stderr) {
		if (err) throw new Error(err);
		if (stderr) throw new Error(stderr.toString());
		cb(stdout);
	})
}

function gitCommit(cb) {
	var cb = cb || function() {};
	exec(COMMANDS.GITCOMMIT, function(err, stdout, stderr) {
		if (err) throw new Error(err);
		if (stderr) throw new Error(stderr.toString());
		cb(stdout);
	})
}

function gitPush(cb) {
	var cb = cb || function() {};
	exec(COMMANDS.GITPUSH, function(err, stdout, stderr) {
		if (err) throw new Error(err);
		if (stderr) console.log(stderr.toString());
		cb(stdout);
	})
}

function changeFile(file, cb) {
	var cb = cb || function() {};
	fs.appendFile(rootdir + file, '' + new Date() + '\n', function(err) {
		if (err) console.log(err);
		cb();
	})
}

function run(file) {

	changeFile(file, add);

	function add() {
		gitAddFile(commit)
	}

	function commit() {
		gitCommit(push)
	}

	function push() {
		gitPush();
	}
}

function cronJob(file) {
	var rule = new Schedule.RecurrenceRule();
	rule.hour = 0;
	rule.minute = 0;
	rule.second = 1;
	Schedule.scheduleJob(rule, function() {
		run(file);
	});
}



module.exports = function(config) {
	var config = config || defaultconfig;
	var trackFile = config.trackFile;
	var remoteaddr = 'https://' + config.username + ':' + config.password + '@' + config.remoteaddr + '';

	gitRmRemote(function() {
		gitAddRemote(remoteaddr, function(stdout) {
			console.log(stdout.toString());
		});
	});



	cronJob(trackFile);

	run(trackFile);
}