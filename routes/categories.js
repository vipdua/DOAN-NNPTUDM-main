var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let categoryModel = require('../schemas/categories');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// GET /api/v1/categories - Ai cung xem duoc
router.get('/', async function (req, res, next) {
    try {
        let data = await categoryModel.find({ isDeleted: false });
        res.send(data);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// GET /api/v1/categories/:id - Ai cung xem duoc
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await categoryModel.findOne({ isDeleted: false, _id: id });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "Khong tim thay danh muc" });
        }
    } catch (error) {
        res.status(404).send({ message: "ID khong hop le" });
    }
});

// POST /api/v1/categories - Chi ADMIN
router.post('/', CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let newCate = new categoryModel({
            name: req.body.name,
            slug: slugify(req.body.name, {
                replacement: '-',
                remove: undefined,
                lower: true,
                trim: true
            }),
            image: req.body.image
        });
        await newCate.save();
        res.status(201).send(newCate);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// PUT /api/v1/categories/:id - Chi ADMIN
router.put('/:id', CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        if (req.body.name) {
            req.body.slug = slugify(req.body.name, {
                replacement: '-',
                lower: true,
                trim: true
            });
        }
        let result = await categoryModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!result) {
            return res.status(404).send({ message: "Khong tim thay danh muc" });
        }
        res.send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// DELETE /api/v1/categories/:id - Chi ADMIN (soft delete)
router.delete('/:id', CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await categoryModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!result) {
            return res.status(404).send({ message: "Khong tim thay danh muc" });
        }
        res.send({ message: "Xoa danh muc thanh cong", category: result });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;