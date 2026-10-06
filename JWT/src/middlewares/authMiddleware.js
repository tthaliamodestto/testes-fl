import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function authMiddleware(req, res, next) {

const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).json({ message: 'Token não informado' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Token inválido' });
    }

}

export default authMiddleware;