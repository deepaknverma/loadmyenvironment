/*
* @Author: Deepak Verma
* @Date:   2015-11-19 12:25:14
* @Last Modified by:   dverma
* @Last Modified time: 2017-06-06 12:12:54
*/

'use strict';
const should = require('should');
const config = require('../../');
const nock = require('nock');
const path = require('path');
const fs = require('fs');
const config_path = path.join(__dirname, '/../resources/config.env');

describe('Enviornment Variable', () => {

	beforeEach((done) => {
		nock('http://localhost')
			.get('/env.json')
			.replyWithFile(200, __dirname + '/../resources/env.json');

		nock('http://localhost')
			.defaultReplyHeaders({
				'Content-Type': 'text/plain'
			})
			.get('/config.env')
			.replyWithFile(200, __dirname + '/../resources/config.env');
		nock('http://localhost')
			.get('/env.js')
			.reply(404);
		done();
	});

	it('should return api object with a file path', (done) => {
		config({
			returnConfig: true,
			functionKey: 'apis',
			configPath: config_path,
			encrypted: true,
			key: 'thi5i5apa55word'
		})
			.then(data => {
				// console.log(data);
				should.equal(typeof data, 'object', 'It is returning an Object');
				should.equal(data.apis.postRequest.emails.noreply, 'noreply@localhost', 'It have value noreply@localhost');
				done();
			})
			.catch(err => {
				console.log(err);
				should.not.exist(err);
				done();
			});
	});

	it('should return true with a file path', (done) => {
		// setting up the environment variable
		process.env.NODE_ENV = 'dev';		
		config({
			returnConfig: false,
			functionKey: 'apis',
			configPath: config_path,
			encrypted: true,
			key: 'thi5i5apa55word'
		})
			.then(data => {
				// console.log(data);
				should.equal(data.apis, true, 'It is returning Bool');
				done();
			})
			.catch(err => {
				console.log(err);
				should.not.exist(err);
				done();
			});
	});

	it('should load the env file in process.env', (done) => {
		process.env.NODE_ENV = 'dev';
		process.env.APP_CONFIG_PATH = path.join(__dirname, '/../resources/config.env');
		config({
			returnConfig: false,
			encrypted: true,
			key: 'thi5i5apa55word'
		})
			.then(data => {
				// console.log(data);
				should.equal(data, true, true);
				should.exist(process.env.NODE_ENV);
				should.exist(process.env.APP_CONFIG_PATH);
				done();
			})
			.catch(err => {
				// console.log(err);
				should.not.exist(err);
				done();
			});
	});

	it('should return true with a file path set in server env', (done) => {
		process.env.NODE_ENV = 'dev';
		process.env.APP_CONFIG_PATH = path.join(__dirname, '/../resources/config.env');
		config({
			returnConfig: false,
			functionKey: 'apis',
			encrypted: true,
			key: 'thi5i5apa55word'
		})
			.then(data => {
				// console.log(data);
				should.equal(data.apis, true, 'It is returning Bool');
				done();
			})
			.catch(err => {
				// console.log(err);
				should.not.exist(err);
				done();
			});
	});

	it('should return apis object with a URL', (done) => {
		config({
			returnConfig: true,
			functionKey: 'apis',
			configPath: 'http://localhost/env.json'
		})
			.then(data => {
				should.equal(typeof data, 'object', 'It is returning an Object');
				done();
			})
			.catch(err => {
				// console.log('err: ', err);
				should.not.exist(err);
				done();
			});
	});

	it('should return apinotifications object with a URL when function keys is an array', (done) => {
		config({
			returnConfig: true,
			functionKey: ['email', 'apiNotifications'],
			configPath: 'http://localhost/env.json'
		})
			.then(data => {
				// console.log(data);
				should.equal(typeof data, 'object', 'It is returning an Object');
				done();
			})
			.catch(err => {
				// console.log('err: ', err);
				should.not.exist(err);
				done();
			});
	});

	it('should return apinotifications object with a URL when functionkeys is a single string', (done) => {
		config({
			returnConfig: true,
			functionKey: 'apiNotifications',
			configPath: 'http://localhost/env.json'
		})
			.then(data => {
				// console.log(data);
				should.equal(typeof data, 'object', 'It is returning an Object');
				done();
			})
			.catch(err => {
				// console.log('err: ', err);
				should.not.exist(err);
				done();
			});
	});

	it.skip('should return api object with a URL when encrypted', (done) => {
		config({
			returnConfig: false,
			functionKey: 'apis',
			configPath: 'http://localhost/config.env',
			encrypted: true,
			key: 'thi5i5apa55word'
		})
			.then(function(data) {
				// console.log(data);
				should.equal(data.apis, true, 'It is returning Bool');
				done();
			})
			.catch(function(err) {
				// console.log(err);
				should.not.exist(err);
				done();
			});
	});

	// NOTE: FIXME: need to revist this case
	it('should return error when key does not exist', function(done) {
		config({
			returnConfig: false,
			functionKey: 'badkey',
			configPath: 'http://localhost/env.json'
		})
			.then(function(data) {
				// console.log(data);
				should.not.exst(data);
				should.equal(data, true, 'It is returning Bool');
				done();
			})
			.catch(function(err) {
				// console.log(err);
				should.exist(err);
				done();
			});
	});

	it('should return object with a URL when array of function keys are passed', function(done) {
		config({
			returnConfig: true,
			functionKey: ['app-port', 'schema', 'proxy'],
			configPath: 'http://localhost/env.json'
		})
			.then(function(data) {
				// console.log(data);
				should.exist(data);
				should.equal(typeof data, 'object', 'It is returning object');
				should.equal(data['app-port'], 3000);
				should.equal(typeof data.proxy, 'object');
				done();
			})
			.catch(function(err) {
				// console.log(err);
				should.not.exist(err);
				done();
			});
	});

	it('should return true with a URL when array of function keys are passed', function(done) {
		config({
			returnConfig: false,
			functionKey: ['app-port', 'proxy'],
			configPath: 'http://localhost/env.json'
		})
			.then(function(data) {
				// console.log(data);
				should.equal(data.proxy, true, 'It is returning Bool');
				should.equal(data['app-port'], true, 'It is returning Bool');
				done();
			})
			.catch(function(err) {
				should.not.exist(err);
				// console.log(err);
				done();
			});
	});

	it('should return Object with a URL when functionKey is not passed', function(done) {
		config({
			returnConfig: true,
			configPath: 'http://localhost/env.json'
		})
			.then(function(data) {
				// console.log(data);
				should.equal(typeof data, 'object', 'It is returning an Object');
				should.equal(data['app-port'], 3000, 'It has value for the port');
				done();
			})
			.catch(function(err) {
				should.not.exist(err);
				// console.log(err);
				done();
			});
	});

	it('should return error a for a URL bad json file', function(done) {
		config({
			returnConfig: true,
			configPath: 'http://localhost/env.js'
		})
			.then(function(data) {
				// console.log(data);
				should.not.exist(data);
				done();
			})
			.catch(function(err) {
				should.exist(err);
				// console.log(err);
				done();
			});
	});
//
	it.skip('should return object with a file path when functionKey is not passed', function(done) {
		config({
			returnConfig: true,
			configPath: config_path
		})
			.then(function(data) {
				// console.log(data);
				should.equal(typeof data, 'object', 'It is returning an Object');
				done();

			})
			.catch(function(err) {
				should.not.exist(err);
				// console.log(err);
				done();
			});
	});

	it('should throw an error', function(done) {
		config()
			.then(function(data) {
				should.not.exist(data);
				done();
			})
			.catch(function(err) {
				should.equal(err.title, 'ConfigError', err.title);
				done();
			});
	});

	it('should throw an error invalid config path', function(done) {
		config({
			returnConfig: true,
			configPath: '/bad/path/env.json'
		})
			.then(function(data) {
				// console.log(data);
				should.not.exist(data);
				done();
			})
			.catch(function(err) {
				// console.log(err)
				should.exist(err);
				should(err).have.property('code', 'MODULE_NOT_FOUND');
				done();
			});
	});

	it('should throw an error bad json', function(done) {
		config({
			returnConfig: true,
			configPath: path.join(__dirname, '../data/bad-sample.json')
		})
			.then(function(data) {
				// console.log(data);
				should.not.exist(data);
				done();
			})
			.catch(function(err) {
				// console.log(err)
				should.exist(err);
				// should(err).have.property('code','MODULE_NOT_FOUND');
				done();
			});
	});


	it('should return error for invalid key', function(done) {
		config({
			returnConfig: true,
			functionKey: 'database',
			configPath: path.join(__dirname, '/../resources/config.env'),
			encrypted: true,
			key: 'xxx'
		})
			.then(function(data) {
				// console.log(data);
				should.not.exist(data);
				done();

			})
			.catch(function(err) {
				// console.log(err);
				should.exist(err);
				should(err.title).equal('ConfigError');
				done();
			});
	});
	afterEach(() => {
		nock.cleanAll();
	});
});


