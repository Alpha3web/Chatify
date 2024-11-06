const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => { 
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).send('Invalid token');
            }
            req.userId = decoded.userId;
            next();
        });
    } else {
        next();
    }
};

const authenticate = async (req, res, next) => {
    const token = req?.headers?.cookie?.split("=")[1];
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.clearCookie('token').status(401).send('Invalid token');
    }
};

const authenticateSocket = async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Unauthorized'));
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        socket.userId = decoded.userId;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
};

module.exports = { authenticateToken, authenticate, authenticateSocket };