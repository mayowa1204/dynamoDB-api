const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({
    region:"eu-west-2",
    accessKeyId:"accessKeyId",
    secretAccessKeyId:"secretAccessKeyId",
    endpoint:"http://localhost:8000"
});

module.exports = client;