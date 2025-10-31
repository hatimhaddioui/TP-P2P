const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
const dbName = "tp_node";

async function getCollection() {
    await client.connect();
    const db = client.db(dbName);
    return db.collection("messages"); // collection MongoDB
}

async function addMessage(name, message) {
    const col = await getCollection();
    return await col.insertOne({ name, message, date: new Date() });
}

async function getMessages() {
    const col = await getCollection();
    return await col.find({}).sort({ date: -1 }).toArray();
}

module.exports = { addMessage, getMessages };
