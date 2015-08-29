#!/usr/bin/env node

var fs = require('fs');

var argv = process.argv.slice(2);

var help =  "usage: net-notes [options] \n\n" +
    "Searches files for TODO, FIXME or OPTIMISE tags within your project,\n" +
    "displaying the line number and file name along with the tag description\n"+
    "options:\n" +  "[directory_name] # Optional parameter, will run from current directory\n" +
    "-h, [--help] # Show this help message and quit";

var tasks = {};
tasks.help = function() {
    console.log(help);
};

tasks.search = function(dir, action) {
    if (typeof(action) !== "function")
        action = function(error, file) {};

    fs.readdir(dir, function(err, list) {
        if (err) {
            return action(err);
        }

        list.forEach(function(file) {
            var path = dir + "/" + file;

            fs.stat(path, function(err, stat) {
                //console.log(path + " is a file? " + stat.isFile());
                if (stat && stat.isDirectory()) {
                    tasks.search(path, action);
                }
                else if (stat && stat.isFile()) {
                    checkFile(path);
                }
                else
                {
                    action(null, path);
                }
            });
        });
    });
};

checkFile = function(f) {
    // Create a pattern to match on
    var pattern = /(todo|fixme|optimise|optimize)\W(.*)/i;
    var items = [];
    var lineNumber = 1;

    var file = fs.readFileSync(f).toString().split('\n');

    file.forEach(function (line) {
        match = line.match(pattern);

        //console.log(pattern);
        //console.log(match);
        if (match) {
            items.push(" * [" +
                       lineNumber.toString() +
                       "] " +
                       match[1].toUpperCase() +
                       ": " +
                       match[2]);
        }

        lineNumber++;
    });

    if (items.length > 0) {
        // output file name
        console.log(f);

        // output matches
        items.forEach(function(item) {
             console.log(item);
        });
    }
};

var LogLevel = {
    "INF": 0,
    "WRN": 1,
    "ERR": 2,
    "DBG": 3
};

function dbg_prefix(lvl) {
    var prefix = '';
    if (lvl === undefined || lvl === null)
        lvl = LogLevel.DBG;

    switch(lvl)
    {
        case lvl.INF:
        {
            prefix = "[INFO]";
            break;
        }
        case lvl.WRN:
        {
            prefix = "[WARN]";
            break;
        }
        case lvl.ERR:
        {
            prefix = "[ERROR]";
            break;
        }
        case lvl.DBG:
        {
            prefix = "[DEBUG]";
            break;
        }
        default: break;
    }

    return prefix;
}

function dbg_print(msg, lvl) {
     console.log(dbg_prefix(lvl) + msg);
}

function main(argc, argv) {
    if (argv[0] === "--help" || argv[0] === "-h") {
        tasks.help();
    }
    else if (argv[0] !== null && argv[0] !== 'undefined')
    {
        tasks.search(argv[0]);
    }
    else
    {
        tasks.search(".");
    }
}

main(argv.length, argv);
