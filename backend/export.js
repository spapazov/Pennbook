require('dotenv').config()
const db = require('./db/database');
const fs = require('fs');

const filename = 'input.txt';

db.getMapReduceData(true, false, function(err, result) {

    if (err) throw err;

    let content = "";
    result.forEach(value => {
        content += `${value}\n`;
    });

    fs.writeFile(filename, content, function (err) {
        if (err) throw err;
        console.log('Exported data!');
    }); 
});

