const { MongoClient } = require("mongodb");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// MongoDB Configuration
const MONGODB_URL = "mongodb://127.0.0.1:27017";
const DB_NAME = "tp_node";
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Global variables
let db = null;
let mongoConnected = false;

// Initialize MongoDB connection
async function initializeMongoDB() {
    try {
        console.log("🔄 Connexion à MongoDB...");
        const client = await MongoClient.connect(MONGODB_URL);
        db = client.db(DB_NAME);
        mongoConnected = true;
        await db.command({ ping: 1 });
        console.log("✅ MongoDB connecté :", DB_NAME);

        if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
            console.log("📁 Dossier uploads créé :", UPLOADS_DIR);
        }
    } catch (error) {
        console.error("❌ Erreur MongoDB :", error.message);
    }
}
initializeMongoDB();

function getUsersCollection() {
    if (!db) throw new Error("MongoDB non connecté");
    return db.collection("users");
}

function getFilesCollection() {
    if (!db) throw new Error("MongoDB non connecté");
    return db.collection("files");
}

// Utilitaires
function getRequestData(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
    });
}

function getBinaryData(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", c => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

// ----------- ROUTES HANDLERS ---------------

async function register(req, res) {
    try {
        const data = await getRequestData(req);
        const users = getUsersCollection();

        if (!data.login || !data.password || !data.firstName || !data.lastName) {
            return send(res, 400, { success: false, error: "Tous les champs sont requis" });
        }

        const exists = await users.findOne({ login: data.login });
        if (exists) return send(res, 400, { success: false, error: "User already exists" });

        const user = { ...data, createdAt: new Date() };
        const result = await users.insertOne(user);

        send(res, 200, { success: true, message: "User registered", mongoId: result.insertedId });
    } catch (err) {
        send(res, 500, { success: false, error: err.message });
    }
}

async function login(req, res) {
    try {
        const data = await getRequestData(req);
        const users = getUsersCollection();
        const user = await users.findOne({ login: data.login, password: data.password });

        if (!user) return send(res, 401, { success: false, error: "Invalid credentials" });

        send(res, 200, { success: true, user });
    } catch (err) {
        send(res, 500, { success: false, error: err.message });
    }
}

async function upload(req, res) {
    try {
        const userLogin = req.headers["user-login"];
        const fileName = req.headers["file-name"] || "file.bin";

        if (!userLogin) return send(res, 400, { success: false, error: "User login required" });

        const buffer = await getBinaryData(req);
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = path.join(UPLOADS_DIR, `${userLogin}_${Date.now()}_${safeName}`);
        fs.writeFileSync(filePath, buffer);

        const hash = crypto.createHash("sha256").update(buffer).digest("hex");
        const files = getFilesCollection();

        const meta = {
            name: fileName,
            userLogin,
            hash,
            size: buffer.length,
            uploadDate: new Date(),
            filePath
        };
        const result = await files.insertOne(meta);

        send(res, 200, { success: true, message: "File uploaded", mongoId: result.insertedId, meta });
    } catch (err) {
        send(res, 500, { success: false, error: err.message });
    }
}

async function find(req, res) {
    try {
        const url = require("url").parse(req.url, true);
        const userLogin = url.query.user;
        const files = getFilesCollection();
        const list = await files.find({ userLogin }).sort({ uploadDate: -1 }).toArray();
        send(res, 200, { success: true, files: list });
    } catch (err) {
        send(res, 500, { success: false, error: err.message });
    }
}

async function show(req, res) {
    try {
        const url = require("url").parse(req.url, true);
        const userLogin = url.query.user;
        const files = getFilesCollection();
        const last = await files.findOne({ userLogin }, { sort: { uploadDate: -1 } });
        if (!last || !fs.existsSync(last.filePath))
            return send(res, 404, { success: false, error: "No file found" });

        const image = fs.readFileSync(last.filePath);
        res.writeHead(200, { "Content-Type": "image/png", "Access-Control-Allow-Origin": "*" });
        res.end(image);
    } catch (err) {
        send(res, 500, { success: false, error: err.message });
    }
}

function logout(req, res) {
    send(res, 200, { success: true, message: "Logout successful" });
}

async function debugDB(req, res) {
    try {
        const users = getUsersCollection();
        const files = getFilesCollection();
        const stats = {
            usersCount: await users.countDocuments(),
            filesCount: await files.countDocuments(),
            users: await users.find({}).toArray(),
            files: await files.find({}).toArray()
        };
        send(res, 200, { success: true, stats });
    } catch (err) {
        send(res, 500, { success: false, error: err.message });
    }
}

// Helper pour réponses JSON
function send(res, status, data) {
    res.writeHead(status, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    });
    res.end(JSON.stringify(data));
}

// Export
exports.start = (req, res) => send(res, 200, { success: true, message: "Server running" });
exports.register = register;
exports.login = login;
exports.upload = upload;
exports.find = find;
exports.show = show;
exports.logout = logout;
exports.debugDB = debugDB;
