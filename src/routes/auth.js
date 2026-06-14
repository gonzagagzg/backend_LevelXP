import { Router } from "express";
import {eventos } from "../events/sistemaEventos.js"
import { validarCampos, asynHandler } from "../middlewares/avanzado.js";
import pool from '../bd/connection.js' 
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

 

router.post("/registro",
validarCampos(["nombre_usuario","email_usuario","password_usuario","fecha_nacimiento_usuario","pais_usuario"]),
asynHandler(async (req,res) => {
    const {nombre_usuario, email_usuario, password_usuario, fecha_nacimiento_usuario, pais_usuario} = req.body;
 
    if (password_usuario.length <= 7) {
        return res.status(400).json({
            error: 'La contraseña debe tener más de 8 caracteres'
        });
    }

    const[usuariosPrevios] = await pool.query("SELECT id_usuario FROM usuarios WHERE email_usuario = ?",[email_usuario]);
    if(usuariosPrevios.length > 0){
        return res.status(409).json({
            error:'Email ya esta registrado'
        });
    }
 
    const hashPassword = await bcrypt.hash(password_usuario, 12);
 
    const [resultado]= await pool.query(
        "INSERT INTO usuarios(nombre_usuario, email_usuario, password_usuario, fecha_nacimiento_usuario, pais_usuario) VALUES (?,?,?,?,?)",
        [nombre_usuario, email_usuario, hashPassword, fecha_nacimiento_usuario, pais_usuario]
    );
 
 
    const nuevoUsuario = {id_usuario:resultado.insertId, nombre_usuario, email_usuario}
    eventos.emit("usuario:registrado",nuevoUsuario)
    res.status(201).json({
        mensaje:"Registro exitoso",datos:nuevoUsuario
    })
}))

router.post("/login",
validarCampos(["email_usuario","password_usuario"]),
asynHandler(async (req,res) => {
    const {email_usuario, password_usuario} = req.body;
    // Buscamos al usuario solo por email primero para verificar su estado
    const[rows] = await pool.query("SELECT * FROM usuarios WHERE email_usuario = ?",[email_usuario]);
    
    if(rows.length === 0){
        return res.status(401).json({error: "El correo electrónico no está registrado"});
    }

    const usuario = rows[0];

    // Si el usuario existe pero está desactivado, bloqueamos el acceso inmediatamente
    if (!usuario.estado_usuario) {
        return res.status(403).json({ error: "Tu cuenta ha sido desactivada. Por favor, contacta con el administrador del Gremio." });
    }

    const passwordValido = await bcrypt.compare(password_usuario, usuario.password_usuario);
    if(!passwordValido){
         return res.status(401).json({error: "Contraseña incorrecta"});
    }
    const token = jwt.sign(
        {
            id: usuario.id_usuario, 
            email_usuario: usuario.email_usuario, 
            nombre_usuario: usuario.nombre_usuario,
            rol: usuario.rol_usuario 
        },
        process.env.JWT_SECRET,
        {expiresIn: '2h'}
    );
     
   eventos.emit("usuarios:login",{usuario: usuario.email_usuario});

   res.json({
     mensaje: "Login Exitoso",
     token: token,
     nombre: usuario.nombre_usuario,
     rol: usuario.rol_usuario 
   });

}));

router.get("/perfil",verifyToken,asynHandler(async(req,res) =>{
        const [ rows] = await pool.query("SELECT id_usuario, nombre_usuario, email_usuario, fecha_nacimiento_usuario, pais_usuario, rol_usuario, creacion_usuario, foto_usuario FROM usuarios WHERE id_usuario = ?",[req.usuario.id]);
        if(rows.length === 0){
            return res.status(404).json({
                error:"USUARIO NO ENCONTRADO"
            });

        }

        res.json({perfil:rows[0]});


    }));

export default router;