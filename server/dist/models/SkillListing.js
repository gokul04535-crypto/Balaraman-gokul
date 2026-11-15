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
exports.SkillListing = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SkillListingSchema = new mongoose_1.Schema({
    provider: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SkillCategory',
        required: true,
        index: true
    },
    proficiencyLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        default: 'All Levels'
    },
    creditCost: {
        type: Number,
        required: true,
        min: [5, 'Skill credit cost must be at least 5 credits'],
        max: [200, 'Skill credit cost cannot exceed 200 credits']
    },
    durationMinutes: {
        type: Number,
        required: true,
        default: 60,
        enum: [30, 45, 60, 90, 120]
    },
    tags: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    learningOutcomes: { type: [String], default: [] },
    sessionFormat: {
        type: String,
        enum: ['1-on-1 Video', 'Hands-on Lab', 'Code Review', 'Consultation'],
        default: '1-on-1 Video'
    },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    totalBookings: { type: Number, default: 0, min: 0 }
}, {
    timestamps: true
});
SkillListingSchema.index({ provider: 1, title: 1 });
SkillListingSchema.index({ category: 1, creditCost: 1, rating: -1 });
exports.SkillListing = mongoose_1.default.model('SkillListing', SkillListingSchema);
