"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. No token provided.'
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'skill_exchange_super_secure_jwt_secret_key_2026_xyz';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.User.findById(decoded.id).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid session token: User not found.'
            });
            return;
        }
        if (user.status === 'suspended') {
            res.status(403).json({
                success: false,
                message: 'Your account has been suspended by an administrator. Please contact support.'
            });
            return;
        }
        req.user = user;
        req.userId = user._id.toString();
        req.role = user.currentRole || user.roles[0];
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Authentication failed. Invalid or expired token.'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required.' });
            return;
        }
        // Admins have overarching privileges
        if (req.user.roles.includes('admin')) {
            return next();
        }
        const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
        if (!hasRole) {
            res.status(403).json({
                success: false,
                message: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role.`
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
