var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let productModel = require('../schemas/products');
let inventoryModel = require('../schemas/inventories');
let mongoose = require('mongoose');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// GET /api/v1/products - Ai cung xem duoc, co filter
router.get('/', async function (req, res, next) {
    try {
        let queries = req.query;
        let titleQ = queries.title ? queries.title : '';
        let min = queries.minprice ? Number(queries.minprice) : 0;
        let max = queries.maxprice ? Number(queries.maxprice) : Number.MAX_SAFE_INTEGER;
        let categoryId = queries.category ? queries.category : null;

        let filter = {
            isDeleted: false,
            price: { $gte: min, $lte: max }
        };
        if (titleQ) {
            filter.title = new RegExp(titleQ, 'i');
        }
        if (categoryId) {
            filter.category = categoryId;
        }

        let data = await productModel.find(filter)
            .populate({ path: 'category', select: 'name slug' });
        res.send(data);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// GET /api/v1/products/:id - Ai cung xem duoc
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await productModel.findOne({ isDeleted: false, _id: id })
            .populate({ path: 'category', select: 'name slug' });
        if (result) {
            // Lay them thong tin ton kho
            let inventory = await inventoryModel.findOne({ product: id });
            res.send({ product: result, inventory: inventory });
        } else {
            res.status(404).send({ message: "Khong tim thay san pham" });
        }
    } catch (error) {
        res.status(404).send({ message: "ID khong hop le" });
    }
});

// POST /api/v1/products - Chi ADMIN moi tao duoc
router.post('/', CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let slug = slugify(req.body.title, {
            replacement: '-',
            remove: undefined,
            lower: true,
            trim: true
        });

        // 1. Tạo sản phẩm mới
        let newProduct = new productModel({
            title: req.body.title,
            slug: slug,
            price: req.body.price,
            images: req.body.images,
            description: req.body.description,
            category: req.body.category
        });
        
        await newProduct.save();

        // 2. Tạo bản ghi tồn kho tương ứng
        let newInventory = new inventoryModel({
            product: newProduct._id,
            stock: req.body.stock || 0
        });
        
        await newInventory.save();

        // 3. Populate thông tin danh mục để trả về cho người dùng
        await newProduct.populate({ path: 'category', select: 'name slug' });

        res.status(201).send({
            product: newProduct,
            inventory: newInventory
        });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// PUT /api/v1/products/:id - Chi ADMIN
router.put('/:id', CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        // Cap nhat slug neu doi title
        if (req.body.title) {
            req.body.slug = slugify(req.body.title, {
                replacement: '-',
                lower: true,
                trim: true
            });
        }
        let result = await productModel.findByIdAndUpdate(id, req.body, { new: true })
            .populate({ path: 'category', select: 'name slug' });
        if (!result) {
            return res.status(404).send({ message: "Khong tim thay san pham" });
        }
        res.send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// DELETE /api/v1/products/:id - Chi ADMIN (soft delete)
router.delete('/:id', CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await productModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!result) {
            return res.status(404).send({ message: "Khong tim thay san pham" });
        }
        res.send({ message: "Xoa san pham thanh cong", product: result });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
