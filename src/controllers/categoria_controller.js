import pool from "../bd/connection.js";


//Get
export const obtenerCategorias = async(req,res) => {
    const [row] = await pool.query('SELECT id_categoria, nombre_categoria, estado_categoria FROM categorias WHERE estado_categoria = true');
    res.json({total : row.length, categorias:row});
}
//Post
export const crearCategoria = async(req,res) => {
    const { nombre_categoria } = req.body;
   
    if(!nombre_categoria){
        return res.status(400).json({error:"El nombre de la categoría es obligatorio"});
    }
  
    const [resultado] = await pool.query(
        "INSERT INTO categorias(nombre_categoria) VALUES (?)",
        [nombre_categoria]
    );
    res.status(201).json({mensaje:"Categoria creada exitosamente",id:resultado.insertId});
}

//Patch
export const actualizarCategoria = async(req,res) => {
    const {id} = req.params;
    const { nombre_categoria, estado_categoria } = req.body;

    if(!nombre_categoria){
        return res.status(400).json({error:"El nombre es obligatorio"});
    }
    if(estado_categoria === undefined){
        return res.status(400).json({error:"El campo estado_categoria es obligatorio"});
    }
    await pool.query(
        "UPDATE categorias SET nombre_categoria=?, estado_categoria=? WHERE id_categoria=?",
        [nombre_categoria, estado_categoria, id]
    );
    res.json({mensaje:"Categoria actualizada exitosamente",id});
}

//Delete
export const eliminarCategoria = async(req,res) =>{
    const {id} = req.params;
    const [resultado] = await pool.query(
        "UPDATE categorias SET estado_categoria = false WHERE id_categoria = ?",
        [id]
    );
    if(resultado.affectedRows === 0){
        return res.status(404).json({error:"Categoria no encontrada"});
    }
    res.json({mensaje:"Categoria desactivada exitosamente", id});
}

// Activar categoría revertir borrado lógico
export const activarCategoria = async(req, res) => {
    const { id } = req.params;
    const [resultado] = await pool.query(
        "UPDATE categorias SET estado_categoria = true WHERE id_categoria = ?",
        [id]
    );
    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Categoria no encontrada" });
    }
    res.json({ mensaje: "Categoria activada exitosamente", id });
}

// Obtener categorías desactivadas 
export const obtenerCategoriasDesactivadas = async(req,res) => {
    const [row] = await pool.query('SELECT id_categoria, nombre_categoria, estado_categoria FROM categorias WHERE estado_categoria = false');
    res.json({total : row.length, categoriasDesactivadas:row});
}