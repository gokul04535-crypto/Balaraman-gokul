"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let mongoMemoryServer = null;
const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill_exchange';
    try {
        // 1. Attempt connecting to a standalone MongoDB instance or cloud URI if running
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 2000,
        });
        console.log(`[Database] Connected successfully to external MongoDB at ${uri}`);
        return uri;
    }
    catch (err) {
        console.warn(`[Database] Standalone MongoDB unavailable (${err.message}). Starting disk-persistent embedded MongoDB...`);
        try {
            // 2. Persistent on-disk storage directory: server/data/db
            const dbPath = path_1.default.resolve(__dirname, '../../data/db');
            if (!fs_1.default.existsSync(dbPath)) {
                fs_1.default.mkdirSync(dbPath, { recursive: true });
            }
            mongoMemoryServer = await mongodb_memory_server_1.MongoMemoryServer.create({
                instance: {
                    dbName: 'skill_exchange',
                    dbPath,
                    storageEngine: 'wiredTiger',
                }
            });
            const memoryUri = mongoMemoryServer.getUri();
            await mongoose_1.default.connect(memoryUri);
            console.log(`[Database] Connected to Persistent Embedded MongoDB (Data saved in server/data/db)`);
            return memoryUri;
        }
        catch (memErr) {
            console.error('[Database] Failed to start embedded persistent MongoDB:', memErr);
            throw memErr;
        }
    }
};
exports.connectDB = connectDB;
const closeDB = async () => {
    await mongoose_1.default.disconnect();
    if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
    }
};
exports.closeDB = closeDB;
