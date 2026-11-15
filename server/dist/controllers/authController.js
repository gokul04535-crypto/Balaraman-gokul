"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestVerification = exports.switchRole = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const CreditTransaction_1 = require("../models/CreditTransaction");
const Notification_1 = require("../models/Notification");
const generateToken = (userId, role) => {
    const secret = process.env.JWT_SECRET || 'skill_exchange_super_secure_jwt_secret_key_2026_xyz';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign({ id: userId, role }, secret, { expiresIn: (expiresIn || '7d') });
};
const register = async (req, res) => {
    try {
        const { name, email, password, role = 'learner' } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
            return;
        }
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
            return;
        }
        const initialCredits = Number(process.env.INITIAL_USER_CREDITS) || 100;
        const assignedRoles = role === 'provider' ? ['learner', 'provider'] : ['learner'];
        const user = await User_1.User.create({
            name,
            email: email.toLowerCase(),
            password,
            roles: assignedRoles,
            currentRole: role === 'provider' ? 'provider' : 'learner',
            creditBalance: initialCredits,
            creditsEarned: 0,
            creditsSpent: 0,
            providerProfile: {
                headline: role === 'provider' ? 'Skill Provider' : '',
                bio: '',
                yearsOfExperience: 0,
                rating: 5.0,
                reviewCount: 0,
                isVerified: false,
                verificationStatus: 'unverified'
            }
        });
        // Record initial grant in credit ledger
        await CreditTransaction_1.CreditTransaction.create({
            transactionId: `CTX-INIT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            user: user._id,
            type: 'initial_grant',
            amount: initialCredits,
            balanceAfter: initialCredits,
            description: `Welcome bonus: ${initialCredits} skill credits granted upon registration.`,
            status: 'completed'
        });
        await Notification_1.Notification.create({
            user: user._id,
            title: 'Welcome to Skill Exchange!',
            message: `You received ${initialCredits} skill credits to start booking your first learning sessions.`,
            type: 'credit_earned',
            link: '/dashboard'
        });
        const token = generateToken(user._id.toString(), user.currentRole);
        res.status(201).json({
            success: true,
            message: 'Account created successfully with 100 welcome skill credits.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                currentRole: user.currentRole,
                creditBalance: user.creditBalance,
                creditsEarned: user.creditsEarned,
                creditsSpent: user.creditsSpent,
                avatar: user.avatar,
                providerProfile: user.providerProfile
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Please provide email and password.' });
            return;
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        if (user.status === 'suspended') {
            res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        const token = generateToken(user._id.toString(), user.currentRole);
        res.json({
            success: true,
            message: 'Logged in successfully.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                currentRole: user.currentRole,
                creditBalance: user.creditBalance,
                creditsEarned: user.creditsEarned,
                creditsSpent: user.creditsSpent,
                avatar: user.avatar,
                bio: user.bio,
                interests: user.interests,
                skillsToLearn: user.skillsToLearn,
                providerProfile: user.providerProfile
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                currentRole: user.currentRole,
                creditBalance: user.creditBalance,
                creditsEarned: user.creditsEarned,
                creditsSpent: user.creditsSpent,
                avatar: user.avatar,
                bio: user.bio,
                interests: user.interests,
                skillsToLearn: user.skillsToLearn,
                providerProfile: user.providerProfile,
                status: user.status
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const { name, avatar, bio, interests, skillsToLearn, providerProfile } = req.body;
        const user = await User_1.User.findById(req.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        if (name)
            user.name = name;
        if (avatar !== undefined)
            user.avatar = avatar;
        if (bio !== undefined)
            user.bio = bio;
        if (interests)
            user.interests = interests;
        if (skillsToLearn)
            user.skillsToLearn = skillsToLearn;
        if (providerProfile) {
            user.providerProfile = {
                ...user.providerProfile,
                headline: providerProfile.headline !== undefined ? providerProfile.headline : user.providerProfile.headline,
                bio: providerProfile.bio !== undefined ? providerProfile.bio : user.providerProfile.bio,
                yearsOfExperience: providerProfile.yearsOfExperience !== undefined ? providerProfile.yearsOfExperience : user.providerProfile.yearsOfExperience
            };
        }
        await user.save();
        res.json({
            success: true,
            message: 'Profile updated successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                currentRole: user.currentRole,
                creditBalance: user.creditBalance,
                creditsEarned: user.creditsEarned,
                creditsSpent: user.creditsSpent,
                avatar: user.avatar,
                bio: user.bio,
                interests: user.interests,
                skillsToLearn: user.skillsToLearn,
                providerProfile: user.providerProfile
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProfile = updateProfile;
const switchRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role || !['learner', 'provider', 'admin'].includes(role)) {
            res.status(400).json({ success: false, message: 'Invalid role requested.' });
            return;
        }
        const user = await User_1.User.findById(req.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        // If becoming provider for first time, add provider to roles list
        if (role === 'provider' && !user.roles.includes('provider')) {
            user.roles.push('provider');
        }
        if (role === 'admin' && !user.roles.includes('admin')) {
            res.status(403).json({ success: false, message: 'Cannot switch to admin role without authorization.' });
            return;
        }
        user.currentRole = role;
        await user.save();
        const token = generateToken(user._id.toString(), user.currentRole);
        res.json({
            success: true,
            message: `Switched active dashboard to ${role}.`,
            token,
            currentRole: user.currentRole,
            roles: user.roles
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.switchRole = switchRole;
const requestVerification = async (req, res) => {
    try {
        const { notes, documents } = req.body;
        const user = await User_1.User.findById(req.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        if (!user.roles.includes('provider')) {
            user.roles.push('provider');
        }
        user.providerProfile.verificationStatus = 'pending';
        user.providerProfile.verificationNotes = notes || '';
        if (documents && Array.isArray(documents)) {
            user.providerProfile.verificationDocuments = documents;
        }
        await user.save();
        res.json({
            success: true,
            message: 'Provider verification request submitted for administrator review.',
            providerProfile: user.providerProfile
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.requestVerification = requestVerification;
