var express = require("express");
var router = express.Router();
let userModel = require("../schemas/users");
let { CreateAnUserValidator, validatedResult, ModifyAnUser } = require('../utils/validateHandler');
let userController = require('../controllers/users');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// GET /api/v1/users - Chi ADMIN moi duoc xem tat ca user
router.get("/", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let users = await userController.GetAllUser();
        res.send(users);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// GET /api/v1/users/:id - ADMIN hoac MODERATOR
router.get("/:id", CheckLogin, CheckRole("ADMIN", "MODERATOR"), async function (req, res, next) {
    try {
        let result = await userModel
            .find({ _id: req.params.id, isDeleted: false })
            .populate('role', 'name description');
        if (result.length > 0) {
            res.send(result[0]);
        } else {
            res.status(404).send({ message: "Khong tim thay user" });
        }
    } catch (error) {
        res.status(404).send({ message: "ID khong hop le" });
    }
});

// POST /api/v1/users - Chi ADMIN moi tao duoc user (co chon role)
router.post("/", CheckLogin, CheckRole("ADMIN"), CreateAnUserValidator, validatedResult, async function (req, res, next) {
    try {
        let newItem = await userController.CreateAnUser(
            req.body.username,
            req.body.password,
            req.body.email,
            req.body.role,
            req.body.fullName,
            req.body.avatarUrl,
            req.body.status,
            req.body.loginCount
        );
        let saved = await userModel.findById(newItem._id).populate('role', 'name description');
        res.status(201).send(saved);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// PUT /api/v1/users/:id - Chi ADMIN
router.put("/:id", CheckLogin, CheckRole("ADMIN"), ModifyAnUser, validatedResult, async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await userModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedItem) return res.status(404).send({ message: "Khong tim thay user" });
        let populated = await userModel.findById(updatedItem._id).populate('role', 'name description');
        res.send(populated);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// DELETE /api/v1/users/:id - Chi ADMIN (soft delete)
router.delete("/:id", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await userModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).send({ message: "Khong tim thay user" });
        }
        res.send({ message: "Xoa user thanh cong", user: updatedItem });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;