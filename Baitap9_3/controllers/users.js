let userModel = require('../schemas/users')
let bcrypt = require('bcrypt');
module.exports = {
    CreateAnUser: async function (username, password, email, role,
        avatarUrl, fullName, status, loginCount
    ) {
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            avatarUrl: avatarUrl,
            fullName: fullName,
            status: status,
            loginCount: loginCount
        })
        await newUser.save();
        return newUser;
    },
    QueryByUserNameAndPassword: async function (username, password) {
        // find user by username and verify password using bcrypt
        let getUser = await userModel.findOne({ username: username, isDeleted: false });
        if (!getUser) {
            return false;
        }
        // password is hashed in DB, compare
        let match = await bcrypt.compare(password, getUser.password);
        if (!match) return false;
        return getUser;
    },
    FindUserById: async function (id) {
        return await userModel.findOne({
            _id: id,
            isDeleted: false
        }).populate('role')
    },
    ChangePassword: async function (userId, oldPassword, newPassword) {
        let user = await userModel.findById(userId);
        if (!user || user.isDeleted) {
            throw new Error('User not found');
        }
        let match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            throw new Error('Old password is incorrect');
        }
        user.password = newPassword; // will be hashed by pre('save')
        await user.save();
        return user;
    }
}