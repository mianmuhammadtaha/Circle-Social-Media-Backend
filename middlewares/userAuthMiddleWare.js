const jwt = require('jsonwebtoken');

function authMiddleWare(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "No token provided" })
    }

    const token = authHeader.split(" ")[1];

    try {
        const decode = jwt.verify(token, process.env.SECRET_KEY)
        req.user_id = decode.id;
        return next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token Expired" })
        }
        return res.status(401).json({ success: false, message: "Invalid Token" })
    }

}

module.exports = {authMiddleWare}