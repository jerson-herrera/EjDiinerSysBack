const pool = require('../conexion/conexion.js');


// Obtener TODOS los Productos
const getProductos = async (req, res) => {
    try {
        const respuesta = await pool.query('SELECT * FROM productos');
        
        if (respuesta.rows.length === 0) {
            res.status(404).json({ message: 'No se encontraron productos' });
        } else {
            res.status(200).json(respuesta.rows);
        }
    } catch (error) {
        console.error('Error en la consulta a la base de datos: ', error);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
};





// Obtener producto especifico por (id).
const getProductoById = async (req, res) => {
    const id = parseInt(req.params.id);

    // Verificar si el ID es un numero valido y es un numero entero positivo
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ mensaje: 'El ID proporcionado no es un numero entero positivo valido.' });
        return; // Salir de la funcion
    }

    try {
        const respuesta = await pool.query('SELECT * FROM productos WHERE productoid = $1', [id]);

        if (respuesta.rows.length > 0) {
            res.status(200).json(respuesta.rows);
        } else {
            res.status(404).json({ mensaje: 'No se encontro un producto con el ID ' + id + ' que has proporcionado.' });
        }
    } catch (error) {
        console.error('Error en la consulta a la base de datos: ', error);
        res.status(500).json({ mensaje: 'Error en la consulta a la base de datos' });
    }
};





//Crear producto

const createProducto = async (req, res) => {
    const { nombre, descripcion, precio, categoria } = req.body;

    // Verificar si alguno de los campos esta vacío
    if (nombre === "" || descripcion === "" || precio === "" || categoria === "") {
        res.status(400).json({ error: "Ausencia de datos" });
        return;
    }

    // Verificar que el precio sea un numero positivo
    const precioNumber = parseFloat(precio);
    if (isNaN(precioNumber) || precioNumber <= 0) {
        res.status(400).json({ error: "El precio no es un numero positivo valido" });
        return;
    }

    // Verificar si la categoría es "Comida" o "Bebida"
    if (categoria !== "Comida" && categoria !== "Bebida") {
        res.status(400).json({ error: "Categoría no valida" });
        return;
    }

    try {
        const respuesta = await pool.query('INSERT INTO productos (nombre, descripcion, precio, categoria) VALuES ($1, $2, $3, $4)', [nombre, descripcion, precio, categoria]);

        if (respuesta.rowCount === 1) {
            res.status(201).json({ message: 'Producto creado con éxito' });
        } else {
            res.status(500).json({ error: 'Error al insertar el producto' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////



//Borrar Producto

const deleteProducto = async (req, res) => {
    const id = parseInt(req.params.id);

    // Verificar si el ID es un numero valido y es un numero entero positivo
    if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: 'El ID proporcionado no es un numero entero positivo valido.' });
        return;
    }

    try {
        const response = await pool.query('DELETE FROM productos where productoid = $1', [id]);

        if (response.rowCount > 0) {
            res.json(`El producto con ID: ${id} se elimino correctamente.`);
        } else {
            res.status(404).json(`No se encontro ningun producto con el ID: ${id}`);
        }
    } catch (error) {
        console.error('Error en la consulta a la base de datos: ', error);
        res.status(500).json('Error en la consulta a la base de datos');
    }
};







module.exports = {
    getProductos,
    getProductoById,
    createProducto,
    // updateProducto
    // updateProductoCualquierCosa,
    deleteProducto
};