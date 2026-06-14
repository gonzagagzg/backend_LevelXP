import 'dotenv/config'
import express from 'express';
import path from 'path';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import { loggerDetallado } from './middlewares/avanzado.js';
import sistemEventos from './events/sistemaEventos.js';
import productoRoutes from './routes/productos.js';
import categoriasRoutes from './routes/categoria.js'
import pedidosRoutes from './routes/pedidos.js';
import plataformaRoutes from './routes/plataforma.js';
import detallePedidosRoutes from './routes/detalle_pedidos.js';
import usuariosRoutes from './routes/usuarios.js';
import botRoutes from './routes/bot.js';
import soporteRoutes from './routes/soporte.js';
 
const app = express();
 
const Port = process.env.PORT || 3000;
 
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
 
 
app.use(express.json());
app.use(loggerDetallado);


app.use('/uploads', express.static('uploads'));
 
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/productos", productoRoutes);
app.use("/api/v1/categorias",categoriasRoutes);
app.use("/api/v1/pedidos",pedidosRoutes);
app.use("/api/v1/detalles", detallePedidosRoutes);
app.use("/api/v1/plataformas", plataformaRoutes);
app.use("/api/v1/usuarios", usuariosRoutes);
app.use("/api/v1/bot",botRoutes);
app.use("/api/v1/soporte",soporteRoutes);
 
app.use((err,req,res,next) => {
    console.error(`${err.message}`);
    res.status(500).json({error:"Algo salio mal"});
})
 
app.get('/',(req,res) => {
    res.send('<h1>Conexión establecida con el servidor</h1>');
});
 
app.listen(Port,()=>{
console.log(`Servidor en http://localhost:${Port}`);
});
 
