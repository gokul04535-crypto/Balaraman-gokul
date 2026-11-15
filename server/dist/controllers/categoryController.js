"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const SkillCategory_1 = require("../models/SkillCategory");
const getCategories = async (req, res) => {
    try {
        const categories = await SkillCategory_1.SkillCategory.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: 'Category name is required.' });
            return;
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existing = await SkillCategory_1.SkillCategory.findOne({ slug });
        if (existing) {
            res.status(400).json({ success: false, message: 'Category with this name already exists.' });
            return;
        }
        const category = await SkillCategory_1.SkillCategory.create({
            name,
            slug,
            description: description || '',
            icon: icon || 'BookOpen'
        });
        res.status(201).json({ success: true, message: 'Category created successfully.', category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, isActive } = req.body;
        const category = await SkillCategory_1.SkillCategory.findById(id);
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found.' });
            return;
        }
        if (name) {
            category.name = name;
            category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
        if (description !== undefined)
            category.description = description;
        if (icon !== undefined)
            category.icon = icon;
        if (isActive !== undefined)
            category.isActive = isActive;
        await category.save();
        res.json({ success: true, message: 'Category updated successfully.', category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await SkillCategory_1.SkillCategory.findByIdAndDelete(id);
        res.json({ success: true, message: 'Category deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCategory = deleteCategory;
