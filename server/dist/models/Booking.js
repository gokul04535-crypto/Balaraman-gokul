"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    bookingReference: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    learner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    provider: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    skillListing: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SkillListing',
        required: true,
        index: true
    },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    creditCost: {
        type: Number,
        required: true,
        min: [0, 'Credit cost cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
        default: 'pending',
        index: true
    },
    meetingLink: { type: String, default: '' },
    learnerNotes: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    cancelledBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
    creditDeducted: { type: Boolean, default: false },
    creditRefunded: { type: Boolean, default: false },
    creditRewarded: { type: Boolean, default: false },
    hasReview: { type: Boolean, default: false },
    confirmedAt: { type: Date },
    completedAt: { type: Date }
}, {
    timestamps: true
});
BookingSchema.index({ provider: 1, date: 1, startTime: 1, status: 1 });
BookingSchema.index({ learner: 1, date: 1, startTime: 1, status: 1 });
exports.Booking = mongoose_1.default.model('Booking', BookingSchema);
