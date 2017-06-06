loadmyenvironment (v1.1.0)
[![Build Status](https://travis-ci.org/deepaknverma/loadmyenvironment.svg?branch=master)](https://travis-ci.org/deepaknverma/loadmyenvironment)  
============
A NodeJS module to fetch application related variables from and configuration object either from a file, url or a dependency module. 

OVERVIEW
=========
The best was to have global environment variable is to set them in OS environment. But it is not safe enough. if someone has access to your machine, it can open up a pandora box to access other services in your application network. I wanted a safe way to provide these information to my application. Load environment is capable of attaining below goals:

- Able to load environment from a file path
- Able to load environment from a URL
- Able to either return the variables or set them in process environment.
- Able to decrypt an encrypted configuration file and recursively find information your app need

REQUIRE
========
- returnConfig: if set `true` then return result else set them in process environment
- functionKey: array of all the keys you want to be returned from the configuration. if only one key required then pass as a string
- configPath: configuration path. Can be file path or an url. **Note** *configuration should be an object*
- encrypted: if the file is encrypted?
- key: password to decrypt the configuration

USAGE:
========

see testcases on [github](https://github.com/deepaknverma/loadmyenvironment)

TODO
=====
- currently only support `aes-256-cbc` encryption. need to add more algorithm support


