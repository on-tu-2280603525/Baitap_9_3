let jwt = require('jsonwebtoken')
let userController = require('../controllers/users')
module.exports = {
    checkLogin: async function (req, res, next) {
        try {
            let token;
            if (req.cookies && req.cookies.token) {
                token = req.cookies.token;
            } else {
                token = req.headers.authorization;
                if (!token || !token.startsWith("Bearer")) {
                    return res.status(403).send("ban chua dang nhap");
                }
                token = token.split(' ')[1];
            }
            let result = jwt.verify(token, 'secret');
            if (result && result.exp * 1000 > Date.now()) {
                req.userId = result.id;
                return next();
            }
        } catch (err) {
            // fall through to forbidden
        }
        res.status(403).send("ban chua dang nhap");
    },
    checkRole: function (...requiredRole) {
        return async function (req, res, next) {
            try {
                let userId = req.userId;
                let user = await userController.FindUserById(userId);
                if (!user || !user.role) {
                    return res.status(403).send({ message: "ban khong co quyen" });
                }
                let currentRole = user.role.name && user.role.name.toUpperCase();
                // normalize requiredRole
                let normalized = requiredRole.map(r => r.toUpperCase());
                if (normalized.includes(currentRole)) {
                    return next();
                }
            } catch (err) {
                // ignore
            }
            res.status(403).send({ message: "ban khong co quyen" });
        }
    }
}