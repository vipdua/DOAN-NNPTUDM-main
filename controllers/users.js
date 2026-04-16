let userModel = require("../schemas/users");

module.exports = {
    /**
     * Tao nguoi dung moi
     * @param {string} username
     * @param {string} password
     * @param {string} email
     * @param {ObjectId|string} role - ID cua role
     * @param {string} fullName
     * @param {string} avatarUrl
     * @param {boolean} status
     * @param {number} loginCount
     * @param {ClientSession} session - mongoose session (optional)
     */
    CreateAnUser: async function (
        username, password, email, role,
        fullName, avatarUrl, status, loginCount, session
    ) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        if (session) {
            await newItem.save({ session });
        } else {
            await newItem.save();
        }
        return newItem;
    },

    GetAllUser: async function () {
        let users = await userModel
            .find({ isDeleted: false })
            .populate('role', 'name description');
        return users;
    },

    GetAnUserByUsername: async function (username) {
        let user = await userModel
            .findOne({ isDeleted: false, username: username })
            .populate('role', 'name description');
        return user;
    },

    GetAnUserByEmail: async function (email) {
        let user = await userModel
            .findOne({ isDeleted: false, email: email })
            .populate('role', 'name description');
        return user;
    },

    GetAnUserByToken: async function (token) {
        let user = await userModel
            .findOne({ isDeleted: false, forgotPasswordToken: token });
        if (!user) return null;
        if (user.forgotPasswordTokenExp > Date.now()) {
            return user;
        }
        return null;
    },

    GetAnUserById: async function (id) {
        let user = await userModel
            .findOne({ isDeleted: false, _id: id })
            .populate('role', 'name description');
        return user;
    }
};
