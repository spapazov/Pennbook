const multer  = require('multer');
const AWS = require('aws-sdk');
const db = require('./database.js');
const uuid = require('uuid/v4');

const s3 = new AWS.S3({
    accessKeyId:  process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    Bucket: process.env.S3_BUCKET_NAME
});

const params = {
    Bucket: process.env.S3_BUCKET_NAME,
};

s3.createBucket(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else console.log('Bucket Created Successfully', data.Location);
});

const storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, '');
    }
});

const upload = multer({ storage: storage }).single('picture');

const uploadFile = function(username, file, callback) {

    // Save to dynamodb
    let fileName = `${uuid()}.jpg`;
    db.addPicture(username, fileName, function(err, picture) {
        if (err) {
            callback(err, null);
            return;
        }
        
        // Setting up S3 upload parameters
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer
        };

        // Uploading files to the bucket
        s3.upload(params, function(err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, picture);
        });
    });
};

module.exports = {
    uploadFile: uploadFile,
    upload: upload
}