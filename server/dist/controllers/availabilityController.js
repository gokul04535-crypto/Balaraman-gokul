"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAvailabilitySlot = exports.addAvailabilitySlot = exports.getMyAvailability = exports.getProviderAvailability = void 0;
const AvailabilitySlot_1 = require("../models/AvailabilitySlot");
const getProviderAvailability = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { startDate, endDate } = req.query;
        const query = {
            provider: providerId,
            isBooked: false
        };
        if (startDate && endDate) {
            query.date = { $gte: String(startDate), $lte: String(endDate) };
        }
        else if (startDate) {
            query.date = { $gte: String(startDate) };
        }
        const slots = await AvailabilitySlot_1.AvailabilitySlot.find(query).sort({ date: 1, startTime: 1 });
        res.json({ success: true, slots });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProviderAvailability = getProviderAvailability;
const getMyAvailability = async (req, res) => {
    try {
        const slots = await AvailabilitySlot_1.AvailabilitySlot.find({ provider: req.userId })
            .populate('bookingId')
            .sort({ date: 1, startTime: 1 });
        res.json({ success: true, slots });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyAvailability = getMyAvailability;
const addAvailabilitySlot = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.body;
        if (!date || !startTime || !endTime) {
            res.status(400).json({ success: false, message: 'Please provide date, start time, and end time.' });
            return;
        }
        // Check duplicate
        const existing = await AvailabilitySlot_1.AvailabilitySlot.findOne({
            provider: req.userId,
            date,
            startTime
        });
        if (existing) {
            res.status(400).json({ success: false, message: 'An availability slot already exists for this date and time.' });
            return;
        }
        const slot = await AvailabilitySlot_1.AvailabilitySlot.create({
            provider: req.userId,
            date,
            startTime,
            endTime,
            isBooked: false
        });
        res.status(201).json({ success: true, message: 'Availability slot added.', slot });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addAvailabilitySlot = addAvailabilitySlot;
const deleteAvailabilitySlot = async (req, res) => {
    try {
        const { id } = req.params;
        const slot = await AvailabilitySlot_1.AvailabilitySlot.findById(id);
        if (!slot) {
            res.status(404).json({ success: false, message: 'Slot not found.' });
            return;
        }
        if (slot.provider.toString() !== req.userId) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this slot.' });
            return;
        }
        if (slot.isBooked) {
            res.status(400).json({ success: false, message: 'Cannot delete a booked availability slot.' });
            return;
        }
        await AvailabilitySlot_1.AvailabilitySlot.findByIdAndDelete(id);
        res.json({ success: true, message: 'Availability slot removed.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteAvailabilitySlot = deleteAvailabilitySlot;
