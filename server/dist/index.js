"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const db_1 = require("./config/db");
const seed_1 = require("./seed/seed");
const socket_1 = require("./socket");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        await (0, seed_1.autoSeedIfEmpty)();
        const httpServer = http_1.default.createServer(app_1.app);
        (0, socket_1.initSocketServer)(httpServer);
        httpServer.listen(PORT, () => {
            console.log(`=======================================================`);
            console.log(`🚀 Skill Exchange Platform Backend API & WebSockets Running`);
            console.log(`📍 Port: http://localhost:${PORT}`);
            console.log(`💎 Economy: Credits-Only Model (Strictly Non-Monetary)`);
            console.log(`📡 Real-Time Rooms & WebRTC Signaling: ACTIVE`);
            console.log(`=======================================================`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
