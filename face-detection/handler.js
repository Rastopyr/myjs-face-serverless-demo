"use strict";

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "us-east-1"
});

const rek = new AWS.Rekognition();

function rekognize(event, ctx, cb) {
  const origin = event.headers.origin;

  const rekParams = {
    Image: {
      Bytes: new Buffer(
        event.body.replace("data:image/jpeg;base64,", ""),
        "base64"
      )
    }
  };

  rek
    .detectFaces(rekParams)
    .promise()
    .then(({ FaceDetails }) => {
      cb(null, {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({
          FaceDetails,
          success: true
        })
      });
    })
    .catch(err => {
      cb(null, {
        statusCode: 500,
        bheaders: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({
          err
        })
      });
    });
}

module.exports = {
  rekognize
};
