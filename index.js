#! /usr/bin/env node
var colors = require('colors');
var commandLineArgs = require('command-line-args');
var prompt = require('prompt');
var fs = require('fs');
var async = require('async');

module.exports = fs.existsSync || function existsSync(filePath){
        try{
            fs.statSync(filePath);
        }catch(err){
            if(err.code == 'ENOENT') return false;
        }
        return true;
    };

var cli = commandLineArgs([
    { name: 'verbose', alias: 'v', type: Boolean },
    { name: 'vhost', type: String, defaultOption: true },
    { name: 'ip', type: String, defaultValue: '192.168.89.29' },
    { name: 'box', type: String, defaultValue: 'ubuntu/trusty64'},
    { name: 'mysql', alias: 'm', type: Boolean, defaultValue: false},
    { name: 'all', type: Boolean, defaultValue: false},
    { name: 'composer', alias: 'c', type: Boolean, defaultValue: false},
    { name: 'node', type: Boolean, defaultValue: false},
    { name: 'redis', type: Boolean, defaultValue: false},
    { name: 'git', type: Boolean, defaultValue: false},
    { name: 'bower', type: Boolean, defaultValue: false},
    { name: 'gulp', type: Boolean, defaultValue: false},
])
var options = cli.parse()
var currentPath = process.cwd();

var verbose = function(string)
{
    if( options.verbose ) {
        var args = Array.prototype.slice.call(arguments, 1);
        console.info( '[INFO] ' + string.yellow, args );
    }
}

verbose('Start process, options : ', options);

if( !options.hasOwnProperty('vhost') || !options.vhost ) {
    return console.error('[ERROR] vhost require'.red);
}

if(fs.existsSync( currentPath + '/Vagrantfile')) {
    return console.error('[ERROR] Vagrantfile already exists'.red);
}

if(fs.existsSync( currentPath + '/bootstrap.sh')) {
    return console.error('[ERROR] bootstrap.sh already exists'.red);
}

var fileBootstrap = __dirname + '/templates/bootstrap.sh.template';
var fileMysql = __dirname + '/templates/mysql.sh.template';
var fileNode = __dirname + '/templates/node.sh.template';
var fileGulp = __dirname + '/templates/gulp.sh.template';
var fileBower = __dirname + '/templates/bower.sh.template';
var fileRedis = __dirname + '/templates/redis.sh.template';
var fileComposer = __dirname + '/templates/composer.sh.template';
var fileVhost = __dirname + '/templates/vhost.sh.template';
var fileVagrant = __dirname + '/templates/Vagrantfile.template';
var processFunction = [];

if( options.all ) {
    for( var k in options ) {
        if( k == 'verbose' ) {
            continue;
        }
        if( options[k] === false ) {
            options[k] = true;
        }
    }
}

if( options.gulp || options.bower ) {
    verbose('Set node to true');
    options.node = true;
}

verbose('Read file bootstrap');
fs.readFile(fileBootstrap, 'utf8', function (err,bootstrap) {
    if (err) {
        return console.log('[ERROR]' + err.red);
    }

    if( options.composer ) {
        verbose('composer set to true');
        var composerProcess = function(callback)
        {
            fs.readFile(fileComposer, 'utf8', function (err, composer) {
                if (err) {
                    return console.log('[ERROR]' + err.red);
                }
                callback(null, composer);
            });
        }
        processFunction.push(composerProcess);
    }

    if( options.redis ) {
        verbose('redis set to true');
        var redisProcess = function(callback)
        {
            fs.readFile(fileRedis, 'utf8', function (err, redis) {
                if (err) {
                    return console.log('[ERROR]' + err.red);
                }
                callback(null, redis);
            });
        }
        processFunction.push(redisProcess);
    }

    if( options.node ) {
        verbose('node set to true');
        var nodeProcess = function(callback)
        {
            fs.readFile(fileNode, 'utf8', function (err, node) {
                if (err) {
                    return console.log('[ERROR]' + err.red);
                }
                callback(null, node);
            });
        }
        processFunction.push(nodeProcess);

        if( options.gulp ) {
            verbose('gulp set to true');
            var gulpProcess = function(callback)
            {
                fs.readFile(fileGulp, 'utf8', function (err, gulp) {
                    if (err) {
                        return console.log('[ERROR]' + err.red);
                    }
                    callback(null, gulp);
                });
            }
            processFunction.push(gulpProcess);
        }

        if( options.bower ) {
            verbose('bower set to true');
            var bowerProcess = function(callback)
            {
                fs.readFile(fileBower, 'utf8', function (err, bower) {
                    if (err) {
                        return console.log('[ERROR]' + err.red);
                    }
                    callback(null, bower);
                });
            }
            processFunction.push(bowerProcess);
        }

    }

    if( options.mysql ) {
        verbose('mysql set to true');
        var mysqlProcess = function(callback)
        {
            fs.readFile(fileMysql, 'utf8', function (err, mysql) {
                if (err) {
                    return console.log('[ERROR]' + err.red);
                }
                var baseName, basePassword;
                var schema = {
                    properties: {
                        baseName: {
                            description: 'Database name',
                            required: true
                        },
                        basePassword: {
                            description: 'Database password',
                            required: true,
                            hidden: true
                        }
                    }
                };
                prompt.start();
                prompt.get(schema, function(err, result){
                    baseName = result.baseName;
                    basePassword = result.basePassword;

                    mysql = mysql.replace(/###MYSQLPASSWORD###/g, basePassword);
                    mysql = mysql.replace(/###MYSQLDATABASE###/g, baseName);

                    callback(null, mysql);

                });
            })
        }

        processFunction.push(mysqlProcess);
    }

    if( options.vhost ) {
        var vhostProcess = function(callback) {
            fs.readFile(fileVhost, 'utf8', function (err, vhost) {
                if (err) {
                    return console.log('[ERROR]' + err.red);
                }
                var publicWeb;
                var schema = {
                    properties: {
                        publicWeb: {
                            description: 'Obtionel, sous dossier web'
                        },
                    }
                };
                prompt.start();
                prompt.get(schema, function (err, result) {
                    publicWeb = result.publicWeb;

                    vhost = vhost.replace(/###HOST###/g, options.vhost);
                    vhost = vhost.replace(/###PUBLICWEB###/g, publicWeb);

                    callback(null, vhost);

                });


            })
        }
        processFunction.push(vhostProcess);
    }

    async.series( processFunction, function(err, results) {
        // all tasks have completed, run any post-processing.
        if( results ) {
            bootstrap += results.join("\n");

            fs.readFile(fileVagrant, 'utf8', function (err, vagrant) {
                if (err) {
                    return console.log('[ERROR]' + err.red);
                }

                vagrant = vagrant.replace(/###BOX###/g, options.box);
                vagrant = vagrant.replace(/###IP###/g, options.ip);

                fs.writeFile('Vagrantfile', vagrant, function(err) {
                    if(err) {
                        return console.log('[ERROR] ' + err.red);
                    }

                    fs.writeFile('bootstrap.sh', bootstrap, function(err) {
                        if(err) {
                            fs.unlink('Vagrantfile');
                            return console.log('[ERROR] ' + err.red);
                        }

                        return console.log('Fichier générer'.green);
                    });

                });

            });

        }
    });

});


