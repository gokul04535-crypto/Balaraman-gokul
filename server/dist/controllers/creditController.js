"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionHistory = exports.getCreditSummary = void 0;
const CreditTransaction_1 = require("../models/CreditTransaction");
const User_1 = require("../models/User");
const getCreditSummary = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.userId).select('creditBalance creditsEarned creditsSpent');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        const recentTransactions = await CreditTransaction_1.CreditTransaction.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .limit(5);
        res.json({
            success: true,
            summary: {
                creditBalance: user.creditBalance,
                creditsEarned: user.creditsEarned,
                creditsSpent: user.creditsSpent,
                recentTransactions
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCreditSummary = getCreditSummary;
const getTransactionHistory = async (req, res) => {
    try {
        const { type, page = '1', limit = '20' } = req.query;
        const query = { user: req.userId };
        if (type && type !== 'all') {
            query.type = type;
        }
        const pageNum = Math.max(1, parseInt(String(page), 10));
        const limitNum = Math.max(1, parseInt(String(limit), 10));
        const skip = (pageNum - 1) * limitNum;
        const [transactions, total] = await Promise.all([
            CreditTransaction_1.CreditTransaction.find(query)
                .populate('relatedBooking', 'bookingReference date startTime durationMinutes')
                .populate('relatedListing', 'title category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            CreditTransaction_1.CreditTransaction.countDocuments(query)
        ]);
        res.json({
            success: true,
            transactions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTransactionHistory = getTransactionHistory;
