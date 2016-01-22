#! /usr/bin/env node
var ip = require('ip');
var program = require('commander');
var app = require('./lib/app');

var defaultIp = '192.168.89.29';
var defaultBox = 'ubuntu/trusty64';

console.log( 'ok' );

program
    .version('1.0.0')
    .command('build')
    .option('-v, --verbose', 'vervbose mode')
    .option('-i, --ip <ip>', 'ip to Vagrant machine default : ' + defaultIp, ip.isV4Format, defaultIp)
    .option('-b, --box <box>', 'box Vagrant default : ' + defaultBox, defaultBox)
    .option('-h, --host <host>', 'install apache2 with virtualhost')
    .option('-m, --mysql', 'install mysql')
    .option('-c, --composer', 'install composer')
    .option('-n, --node', 'install node')
    .option('-r, --redis', 'install redis')
    .option('-g, --git', 'install git')
    .option('-b, --bower', 'install bower, if use install node')
    .option('-G, --gulp', 'install gulp, if use install node')
    .option('-t, --test', 'test mode, no save file')
    .option('-A, --all', 'use all options')
    .action(app)


program.parse(process.argv);