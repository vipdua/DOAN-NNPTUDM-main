var express = require("express");
var router = express.Router();
let roleModel = require("../schemas/roles");
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// GET /api/v1/roles - Ai cung xem duoc
router.get("/", async function (req, res, next) {
    try {
        let roles = await roleModel.find({ isDeleted: false });
        res.send(roles);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// GET /api/v1/roles/:id - Ai cung xem duoc
router.get("/:id", async function (req, res, next) {
    try {
        let result = await roleModel.findOne({ _id: req.params.id, isDeleted: false });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "Khong tim thay role" });
        }
    } catch (error) {
        res.status(404).send({ message: "ID khong hop le" });
    }
});

// POST /api/v1/roles - Cho phép tạo role không cần đăng nhập để tiện test
router.post("/", async function (req, res, next) {
    try {
        let newItem = new roleModel({
            name: req.body.name,
            description: req.body.description
        });
        await newItem.save();
        res.status(201).send(newItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /api/v1/roles/:id - Chi ADMIN
router.put("/:id", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await roleModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedItem) {
            return res.status(404).send({ message: "Khong tim thay role" });
        }
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// DELETE /api/v1/roles/:id - Chi ADMIN (soft delete)
router.delete("/:id", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await roleModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).send({ message: "Khong tim thay role" });
        }
        res.send({ message: "Xoa role thanh cong", role: updatedItem });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;