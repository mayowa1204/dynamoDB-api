const db = require("./db");
const {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
    UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const {
    marshall,
    unmarshall
} = require("@aws-sdk/util-dynamodb");

const getSong = async (event) => {
    const response = {
        statusCode: 200
    };
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            key: marshall({
                songId: event.pathParamerers.songId
            })
        }
        const {
            item
        } = await db.send(new GetItemCommand(params))
        console.log(item)
        response.body = JSON.stringify({
            messsage: "Successfully retrieved song",
            data: (Item) ? unmarshall(Item) : {},
            rawData: Item,
        })
    } catch (e) {
        console.log(e)
        response.statusCode = 500
        response.body = JSON.stringify({
            message: "Failed to get song.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
}
const createSong = async (event) => {
    const response = { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(body || {}),
        };
        const createResult = await db.send(new PutItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully created song.",
            createResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to create song.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const updateSong = async (event) => {
    const response = { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        const objKeys = Object.keys(body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ songId: event.pathParameters.songId }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };
        const updateResult = await db.send(new UpdateItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully updated song.",
            updateResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to update song.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const deleteSong = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ songId: event.pathParameters.songId }),
        };
        const deleteResult = await db.send(new DeleteItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully deleted song.",
            deleteResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to delete song.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const getAllSongs = async () => {
    const response = { statusCode: 200 };

    try {
        const { Items } = await db.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }));

        response.body = JSON.stringify({
            message: "Successfully retrieved all songs.",
            data: Items.map((item) => unmarshall(item)),
            Items,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve songs.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

module.exports = {
    getSong,
    createSong,
    updateSong,
    deleteSong,
    getAllSongs,
};