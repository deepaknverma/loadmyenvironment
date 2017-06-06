/*
* @Author: Deepak Verma
* @Date:   2015-10-26 18:12:08
* @Last Modified by:   dverma
* @Last Modified time: 2017-06-06 12:11:49
*/

'use strict';
const isURL = require('is-url');
const request = require('request-promise');
const errs = require('errs');
const htauCrypt = require('encryptit').crypt;
const _ = require('underscore');
const tmp = require('tmp');
const fs = require('fs');
const node_env = process.env.NODE_ENV || 'dev';
let payload, returnValue = {};
/**
 * [recursiveIteration recurively search for needle in the object]
 * @param  {[object]} object      [object to search from]
 * @param  {[string]} functionKey [needle to search]
 * @return {[string]}             [return object value if found else bool false]
 */
const recursiveIteration = (object, functionKey) => {
	for (var property in object) {
		if (object.hasOwnProperty(property)) {
			if (property === functionKey) {
				payload = object[property];
			}
			else if (typeof object[property] === 'object') {
				recursiveIteration(object[property], functionKey);
			}
		}
	}
};

const processEnv = (env, options) => {
	return new Promise((success, fail) => {
		if (typeof env === 'object') {
			if (options.functionKey) {
				const functionkeys = options.functionKey;
				if (Array.isArray(functionkeys) && functionkeys.length) {
					for (let i = 0, len = functionkeys.length; i < len; i++) {
						recursiveIteration(env, functionkeys[i]);
						if (options.returnConfig === true) {
							returnValue[functionkeys[i]] = payload;
						} else {
							process.env[functionkeys[i]] = payload;
							returnValue[functionkeys[i]] = true;
						}
					}
					return success(returnValue);
				} else {
					recursiveIteration(env, functionkeys);
					if (options.returnConfig === true) {
						returnValue[functionkeys] = payload;
					} else {
						process.env[functionkeys] = payload;
						returnValue[functionkeys] = true;
					}
				}
				return success(returnValue);
			} else {
				if (options.returnConfig === true) {
					return success(env);
				} else {
					process.env[node_env] = env;
					return success(true);
				}
			}
		} else {
			return fail(errs.create({
				title: 'ConfigError',
				message: 'unable to process environment file',
				options: options
			}));
		}
	});
};

/**
 * [config pulls Config out of the path set in env]
 * @param  {[object]} options [{return: bool, functionKey: key name to be retrieved}]
 * @return {[object]}         [description]
 * @sample Path 	//var path = 'https://gist.githubusercontent.com/deepaknverma/6119f4e95730e6533fd6/raw/43d36d1058e24e2cbbfeb3f5b763d4ddcbc613fb/sample.json';
 *         			//var path = './env.json';
 */
const config = (options) => {
	return new Promise((success, fail) => {
		let config, errors, jsonConfig, env, requestOptions;
		// We need configuration to work with
		if (!options) {
			errors = errs.create({
				title: 'ConfigError',
				message: 'No options supplied',
				options: null
			});
			return fail(errors);
		}

		// default returnConfig to true
		options.returnConfig = (options.returnConfig !== undefined && typeof options.returnConfig === 'boolean') ? options.returnConfig : true;

		// Lets see if the user has passed some config file else we will user the env variable
		if (options.configPath) {
			config = options.configPath;
		} else if (process.env.APP_CONFIG_PATH) {
			config = process.env.APP_CONFIG_PATH;
		}

		// check if path or url
		if (isURL(config)) {
			requestOptions = {
				uri: config,
				json: true,
				resolveWithFullResponse: true
			};
			request(requestOptions)
				.then((response) => {
					const responseBody = response.body;
					if (options.encrypted && options.key) {
						const tmpobj = tmp.fileSync({ postfix: '.env' });
						fs.writeFileSync(tmpobj.name, responseBody, { encoding: 'UTF-8' });
						const crypt = new htauCrypt({
							bytes: 256,
							algorithmSuffix: 'cbc',
							key: options.key,
							inputFilePath: tmpobj.name,
							return: true
						});
						return crypt.decryptCBC();

					} else {
						return responseBody;
					}
				})
				.then((data) => {
					tmp.setGracefulCleanup();
					jsonConfig = (options.encrypted && options.key) ? JSON.parse(data) : data;
					env = _.extend(jsonConfig[node_env], jsonConfig.base);
					return processEnv(env, options);
				})
				.then((data) => {
					return success(data);
				})
				.catch((err) => {
					// console.error('URL Error: ', err);
					errors = errs.create({
						title: 'ConfigError',
						message: err,
						options: options
					});
					return fail(errors);
				});
		} else {
			try {
				if (options.encrypted && options.key) {
					const crypt = new htauCrypt({
						bytes: 256,
						algorithmSuffix: 'cbc',
						key: options.key,
						inputFilePath: config,
						return: true
					});
					crypt.decryptCBC()
						.then((data) => {
							jsonConfig = JSON.parse(data);
							env = _.extend(jsonConfig[node_env], jsonConfig.base);
							return processEnv(env, options);
						})
						.then((data) => {
							return success(data);
						})
						.catch((err) => {
							const error = new Error(err);
							return fail(errs.create({
								title: 'ConfigError',
								code: 10109,
								message: (error.message) ? error.message : 'Env Configuration Error',
								options: null
							}));
						});
				} else {
					jsonConfig = require(config);
					env = _.extend(jsonConfig[node_env], jsonConfig.base);
					processEnv(env, options)
						.then((data) => {
							return success(data);
						})
						.catch((err) => {
							return fail(err);
						});
				}
			}
			catch (err) {
				return fail({ code: 'MODULE_NOT_FOUND', message: 'Unable to require config file', trace: err });
			}

		}

	});
};

module.exports = config;
