const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

const databaseName = 'horseapp';

let db;
async function connectDB() {
    await client.connect().then(() => {
        db = client.db(databaseName);
        console.log('horsed with mongodb');
    }).catch((err) => {
        console.error('error while horsing with mongodb', err);
    });
}

function getDB() {
    if (!db) throw new Error('horse database not connected');
    return db;
}

module.exports = { connectDB, getDB };