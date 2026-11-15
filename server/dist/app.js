"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const categories_1 = __importDefault(require("./routes/categories"));
const skills_1 = __importDefault(require("./routes/skills"));
const availability_1 = __importDefault(require("./routes/availability"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const credits_1 = __importDefault(require("./routes/credits"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const admin_1 = __importDefault(require("./routes/admin"));
const notifications_1 = __importDefault(require("./routes/notifications"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
// Middleware
exports.app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health Check
const healthHandler = (req, res) => {
    res.json({
        status: 'healthy',
        system: 'Skill Exchange Platform',
        economy: 'credits-only',
        currencyModel: 'Credits-Only (Non-Monetary)',
        timestamp: new Date().toISOString()
    });
};
exports.app.get('/health', healthHandler);
exports.app.get('/api/health', healthHandler);
// API Routes
exports.app.use('/api/auth', auth_1.default);
exports.app.use('/api/categories', categories_1.default);
exports.app.use('/api/skills', skills_1.default);
exports.app.use('/api/availability', availability_1.default);
exports.app.use('/api/bookings', bookings_1.default);
exports.app.use('/api/credits', credits_1.default);
exports.app.use('/api/reviews', reviews_1.default);
exports.app.use('/api/admin', admin_1.default);
exports.app.use('/api/notifications', notifications_1.default);
// 404 Handler
exports.app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});
// Global Error Handler
exports.app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error occurred.'
    });
});
