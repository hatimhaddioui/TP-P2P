const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
const dbName = "tp_node";

async function getCollection() {
    await client.connect();
    const db = client.db(dbName);
    return db.collection("users");
}

async function createUser(username, password) {
    const col = await getCollection();
    const hashed = await bcrypt.hash(password, 10);
    const result = await col.insertOne({ username, password: hashed });
    return result;
}

async function authenticate(username, password) {
    const col = await getCollection();
    const user = await col.findOne({ username });
    if (!user) return false;
    const match = await bcrypt.compare(password, user.password);
    return match ? user : false;
}

module.exports = { createUser, authenticate };
