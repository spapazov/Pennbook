require('dotenv').config()
const db = require('./db/database');
const fs = require('fs');

let args = process.argv.slice(2);

if (args.length == 0) {
    console.log("Please specify input file");
    return;
}

const filename = args[0];


fs.readFile(filename, {"encoding": "utf8"}, (err, data) => {

    if (err) throw err;

    let lines = data.split("\n").filter(l => l.length > 0);

    let result = [];
    lines.forEach(l => {
        let split = l.split(/\s+/);
        let user1 = split[0];
        let second = split.splice(1).filter(v => v.length > 0);
        second.forEach(v => {
            let split = v.split(':');
            let user2 = split[0];
            let score = Number(split[1]);
            if (Number.isNaN(score)) {
                score = 0;
            }
            result.push({
                username1: user1,
                username2: user2,
                score: score,
            });
        });  
    });
    
    db.saveAdsorptionResult(result, (err, _) => {
        if (err) throw err;
        console.log("Imported data!");
    })

});

