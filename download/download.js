// modules
const aws = require('aws-sdk');
const iconv = require('iconv-lite');
const request = require('request');
const line = require('@line/bot-sdk');
const moment = require("moment");
const client = new line.Client({ channelAccessToken: process.env.LINE_ACCESS_TOKEN });
const s3 = new aws.S3({ apiVersion: '2006-03-01', region: 'ap-northeast-1' });

// constant
const url = "http://k-db.com/stocks/" + moment().format("YYYY-MM-DD") + "?download=csv";

exports.handler = (event, context) => {
  request({ url: url, encoding: null }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const result = iconv.decode(body, "Shift_JIS").toString().replace(/\r\n?/g,"\n").trim();
      const params = {
        Bucket: "sminamot-stock",
        Key: "csv/" + moment().format("YYYYMMDD") + ".csv",
        Body: result,
      };
      const message = {
        type: "text",
        text: "upload failed",
      };
      s3.putObject(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          message["text"] = "upload failed";
          client.pushMessage(process.env.LINE_TO, message)
            .catch((err) => {
              console.log(err);
            });
        }
        else {
          console.log("OK"); // successful response
        }
      });
    } else {
      console.log("k-db request error");
      console.log(error);
      console.log(response);
    }
  });
};
