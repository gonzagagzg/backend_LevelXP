import jwt from 'jsonwebtoken';

export const verifyToken = (req,res,next) => {
    const authHeader = req.headers['authorization'];

    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({
            error:'Denegado.Token no proporcionado o es invalido'

        });
    }

    const token = authHeader.split(' ')[1];

    try{
        const payload = jwt.verify(token,process.env.JWT_SECRET);
        req.usuario = payload;
        next();

    }catch(error){
        return res.status(403).json({
            error:'Token expiro o corrupto'

        });
    }
}