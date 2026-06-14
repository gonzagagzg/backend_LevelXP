import { GoogleGenAI } from "@google/genai";
import pool from "../bd/connection.js";

const ai = new GoogleGenAI({});
 
export const consultarBot = async (req, res) => {
 
    const { pregunta } = req.body;
    if (!pregunta) {
        return res.status(400).json({ error: "Hazme una pregunta" });
    }
 
    try {
        const [row]= await pool.query(
            'SELECT v.*, c.nombre_categoria AS categoria_nombre, p.nombre_plataforma AS plataforma_nombre ' +
            'FROM videojuego v ' +
            'INNER JOIN categorias c ON v.categoria_id = c.id_categoria ' +
            'INNER JOIN plataforma p ON v.plataforma_id = p.id_plataforma WHERE v.estado_vjuego = true');

        const catalogoTexto = row.map(v => `Videojuego: ${v.nombre_vjuego},
        Descripcion: ${v.descripcion_vjuego},
        Precio: ${v.precio_vjuego},
        Stock: ${v.stock_vjuego},
        Categoria: ${v.categoria_nombre},
        Plataforma: ${v.plataforma_nombre},
        Valoracion: ${v.opinioc_vjuego}/10`).join("\n");
        
        const prompt = `
        Eres el asistente virtual de nuestra Tienda de venta videojuegos multiplataforma llamada LevelXP de Ecuador.
        Reglas:
        1."Eres amable, directo, usas emojis de videojuegos, tu estilo es divertido y geek con los usuarios, ademas se breve y habla español"
        2.Si te preguntan algo fuera de la tienda,responde que solo ayudas con  los videojuegos que se te han proporcionado
        3.ESTRUCTURA OBLIGATORIA: Usa saltos de línea (Enter) dobles entre párrafos. Usa viñetas (-) para enlistar juegos. Usa negritas (**) para resaltar nombres y precios. NUNCA envíes todo en un solo párrafo largo.
        4.Si te preguntan por stock, responde con el stock del producto con la información que se te ha proporcionado no te inventes información si no la tienes.
        5.Si te preguntan por stock y es igual a 0, responde que el producto esta agotado
        6.Solo se vende videojuegos que se te ha prporcionado, no se vende ni se da información de otros temas que no sean los videojuegos que se te han proporcionado.
        7.Cuando te pregunten por los juegos disponibles haz una lista con los juegos disponibles.
        8.Envios:"Enviamos a todo el pais por ServiEntrega ($5 adicionales), envios internacionales WESTER UNION ($50 adicionales)"
        9.Pagos: "Aceptamos transferencias del banco pichincha,produbanco,pacifico son los unicos que aceptamos y tarjetas de credito"
        
        Catálogo de productos disponibles en la tienda:
        ${catalogoTexto}


 
        Pregunta del cliente: ${pregunta}`;
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
        });
 
        res.json({respuesta:response.text})
 
 
 
    } catch (error) {
        console.log("Error en el bot", error);
    }
 
}