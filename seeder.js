const mongoose = require('mongoose');
const Role = require('./schemas/roles');
const User = require('./schemas/users');
const Cart = require('./schemas/carts');

mongoose.connect('mongodb://localhost:27017/SangT4')
    .then(async () => {
        console.log("Connected to MongoDB for Seeding...");

        try {
            // 1. Tạo các Vai trò (Roles)
            let adminRole = await Role.findOne({ name: 'ADMIN' });
            if (!adminRole) {
                adminRole = await new Role({ name: 'ADMIN', description: 'Quản trị viên hệ thống' }).save();
                console.log("Created ADMIN role.");
            }

            let userRole = await Role.findOne({ name: 'USER' });
            if (!userRole) {
                userRole = await new Role({ name: 'USER', description: 'Người dùng bình thường' }).save();
                console.log("Created USER role.");
            }

            // 2. Tạo Tài khoản Admin
            let adminUser = await User.findOne({ email: 'tranhoalong2004@gmail.com' });
            if (!adminUser) {
                adminUser = await new User({
                    username: 'admin', // có thể giữ hoặc đổi
                    password: 'Long123@',
                    email: 'tranhoalong2004@gmail.com',
                    role: adminRole._id
                }).save();

                // Tạo giỏ hàng cho Admin
                await new Cart({ user: adminUser._id }).save();
                console.log("Created Admin account (username: 'admin', password: 'adminpassword')");
            } else {
                console.log("Admin account already exists.");
            }

            console.log("Seeding completed successfully!");
            process.exit(0);

        } catch (error) {
            console.error("Error seeding data:", error);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error("Could not connect to MongoDB:", err);
        process.exit(1);
    });
