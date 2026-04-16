var express = require("express");
var router = express.Router();
let userController = require('../controllers/users')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let crypto = require('crypto')
const { CheckLogin } = require("../utils/authHandler");
let cartModel = require('../schemas/carts')
let roleModel = require('../schemas/roles')
const { ChangePasswordValidator, validatedResult } = require("../utils/validateHandler");

// POST /api/v1/auth/register
router.post('/register', async function (req, res, next) {
    try {
        let { username, password, email } = req.body;

        // Tim role USER dong, khong hardcode
        let userRole = await roleModel.findOne({ name: 'USER', isDeleted: false });
        if (!userRole) {
            return res.status(500).send({ message: "Role USER chua duoc tao. Hay chay seeder truoc." });
        }

        let newUser = await userController.CreateAnUser(
            username, password, email, userRole._id
        );
        let newCart = new cartModel({ user: newUser._id });
        await newCart.save();
        await newCart.populate('user');
        res.status(201).send({
            message: "Dang ky thanh cong",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST /api/v1/auth/login
const ENABLE_LOCK = false; // TẮT khóa tài khoản

router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let user = await userController.GetAnUserByUsername(username);

        if (!user) {
            return res.status(401).send({ message: "Ten dang nhap hoac mat khau sai" });
        }

        // Chỉ check lock khi bật
        if (ENABLE_LOCK && user.lockTime && user.lockTime > Date.now()) {
            return res.status(403).send({
                message: "Tai khoan bi khoa. Thu lai sau: " + new Date(user.lockTime).toLocaleString()
            });
        }

        if (bcrypt.compareSync(password, user.password)) {

            // Reset loginCount nếu có bật lock
            if (ENABLE_LOCK) {
                user.loginCount = 0;
                await user.save();
            }

            let token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '24h' });

            res.cookie('NNPTUD_S4', token, {
                maxAge: 30 * 24 * 3600 * 1000,
                httpOnly: true,
                secure: false
            });

            res.send({
                message: "Dang nhap thanh cong",
                token: token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });

        } else {

            // Chỉ tăng loginCount khi bật lock
            if (ENABLE_LOCK) {
                user.loginCount++;

                if (user.loginCount >= 3) {
                    user.loginCount = 0;
                    user.lockTime = Date.now() + 3600 * 1000;
                }

                await user.save();
            }

            res.status(401).send({ message: "Ten dang nhap hoac mat khau sai" });
        }

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// GET /api/v1/auth/me
router.get('/me', CheckLogin, function (req, res, next) {
    res.send(req.user);
});

// POST /api/v1/auth/logout
router.post('/logout', CheckLogin, function (req, res, next) {
    res.cookie('NNPTUD_S4', "", { maxAge: 0, httpOnly: true, secure: false });
    res.send({ message: "Dang xuat thanh cong" });
});

// POST /api/v1/auth/changepassword
router.post('/changepassword', CheckLogin, ChangePasswordValidator, validatedResult, async function (req, res, next) {
    try {
        let { oldpassword, newpassword } = req.body;
        let user = req.user;
        if (bcrypt.compareSync(oldpassword, user.password)) {
            user.password = newpassword;
            await user.save();
            res.send({ message: "Doi mat khau thanh cong" });
        } else {
            res.status(400).send({ message: "Mat khau cu khong dung" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST /api/v1/auth/forgotpassword
router.post('/forgotpassword', async function (req, res, next) {
    try {
        let email = req.body.email;
        let user = await userController.GetAnUserByEmail(email);
        if (user) {
            user.forgotPasswordToken = crypto.randomBytes(32).toString('hex');
            user.forgotPasswordTokenExp = Date.now() + 10 * 60000; // 10 phut
            let url = "http://localhost:3000/api/v1/auth/resetpassword/" + user.forgotPasswordToken;
            await user.save();
            console.log("Reset URL:", url);
        }
        res.send({ message: "Neu email ton tai, duong link dat lai mat khau da duoc gui" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST /api/v1/auth/resetpassword/:token
router.post('/resetpassword/:token', async function (req, res, next) {
    try {
        let token = req.params.token;
        let password = req.body.password;
        if (!password) {
            return res.status(400).send({ message: "Mat khau moi la bat buoc" });
        }
        let user = await userController.GetAnUserByToken(token);
        if (!user) {
            return res.status(400).send({ message: "Token khong hop le hoac da het han" });
        }
        user.password = password;
        user.forgotPasswordToken = null;
        user.forgotPasswordTokenExp = null;
        await user.save();
        res.send({ message: "Dat lai mat khau thanh cong" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
