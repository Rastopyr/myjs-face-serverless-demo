"use strict";

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "us-east-1"
});

const cw = new AWS.CloudWatch();

function invokationCount(event, ctx, cb) {
  const origin = event.headers.origin;
  const functionName =
    (event.queryStringParameters && event.queryStringParameters.functionName) ||
    "invokation-count-speech-invokationCount";

  cw
    .getMetricStatistics({
      EndTime: new Date(),
      StartTime: new Date("2018-06-01"),
      Period: 2592000,
      Namespace: "AWS/Lambda",
      MetricName: "Invocations",
      Statistics: ["Sum"],
      Dimensions: [
        {
          Name: "FunctionName",
          Value: functionName
        }
      ]
    })
    .promise()
    .then(({ Datapoints }) => {
      cb(null, {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({
          Datapoints: Datapoints.reduce((a, { Sum }) => a + Sum, 0),
          success: true
        })
      });
    })
    .catch(err => {
      cb(null, {
        statusCode: 500,
        headers: {
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
  invokationCount
};
