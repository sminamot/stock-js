const aws = require('aws-sdk');
const line = require('@line/bot-sdk');
const moment = require("moment");

const s3 = new aws.S3();
const client = new line.Client({ channelAccessToken: process.env.LINE_ACCESS_TOKEN });

exports.handler = (event, context) => {
  const params = {
    Bucket: "sminamot-stock",
    Key: "csv/" + moment().format("YYYYMMDD") + ".csv"
  };
  const message = {
    type: "text",
    text: "upload failed",
  };
  s3.headObject(params, function(err, data) {
    if (err) {
      if (err.code === "NotFound") {
        message.text = "CSVファイルが存在しません!";
        console.log("file not exists");
      } else {
        message.text = "CSVファイルの確認でS3へのリクエストエラー!";
        console.log("s3 request error");
      }
      client.pushMessage(process.env.LINE_TO, message)
        .catch((err) => {
          console.log(err);
        });
    }
    console.log("OK");
  });
}
