const MongoClient = require('mongodb').MongoClient;
const DB_HOST = process.env.MONGO_HOST;
const DB_NAME = process.env.MONGO_DB;
const DB_PORT = process.env.MONGO_PORT || 27017;
const DB_URL = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

let dbInstance = false;

async function getDb() {
    if (dbInstance) {
        return dbInstance;
    }

    return await newDbInstance();
}

async function newDbInstance() {
    let client = await MongoClient.connect(DB_URL, {useNewUrlParser: true});
    dbInstance = client.db(DB_NAME);

    return dbInstance;
}

module.exports = {getDb, newDbInstance}