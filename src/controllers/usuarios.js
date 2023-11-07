const pool = require('../conexion/conexion.js');


// Obtener TODOS los Usuarios
const getUsuarios = async (req, res) => {
    try {
      const respuesta = await pool.query('SELECT * FROM usuarios');
  
      if (respuesta.rows.length === 0) {
        res.status(404).json({ message: "No se encontraron usuarios" });
      } else {
        res.status(200).json(respuesta.rows);
      }
    } catch (error) {
      console.error("Error en la consulta a la base de datos: ", error);
      res.status(500).json({ error: "Error en la consulta a la base de datos" });
    }
  };
  

// Obtener usuario especifico por (id).
const getUsuarioById = async (req, res) => {
    const id = parseInt(req.params.id);
  
    // Verificar si el ID no es un numero valido o si no es un numero entero
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      res.status(400).json({ mensaje: 'El ID proporcionado no es un numero entero valido o no es positivo.' });
      return; // Salir de la función
    }
  
    try {
      const respuesta = await pool.query('SELECT * FROM usuarios WHERE usuarioid = $1', [id]);
  
      if (respuesta.rows.length > 0) {
        res.json(respuesta.rows);
      } else {
        res.status(404).json({ mensaje: 'No se encontró un usuario con el ID ' + id + ' que has proporcionado.' });
      }
    } catch (error) {
      console.error("Error en la consulta a la base de datos: ", error);
      res.status(500).json({ mensaje: 'Error en la consulta a la base de datos' });
    }
  };
  

// Crear Usuario. 

const bcrypt = require('bcrypt'); // Importamos el módulo bcrypt.
const saltRounds = 10; // Numero de rondas de sal para el hashing

const createUsuario = async (req, res) => {
  const { cedula, nombres, apellidos, tipousuario } = req.body;

  if (cedula === "" || nombres === "" || apellidos === "" || tipousuario === "") {
    res.status(400).json({ error: "Ausencia de datos" });
    return;
  }

  if (tipousuario !== "Administrador" && tipousuario !== "Mesero") {
    res.status(400).json({ error: 'El tipo de usuario no es valido' });
    return;
  }

  try {
    // Generar un hash de la cédula
    const hashedCedula = await bcrypt.hash(cedula, saltRounds);

    const respuesta = await pool.query('INSERT INTO usuarios (cedula, nombres, apellidos, tipousuario) VALUES ($1, $2, $3, $4)', [hashedCedula, nombres, apellidos, tipousuario]);

    if (respuesta.rowCount === 1) {
      res.status(201).json({ message: 'Usuario creado con éxito' });
    } else {
      res.status(500).json({ error: 'Error al insertar usuario' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};


//Update usuario.

const updateUsuario = async (req, res) => {
    const userId = parseInt(req.params.id); // Capturamos el ID del usuario de la URL como numero entero
    const { cedula, nombres, apellidos, tipousuario } = req.body;

    // Validar que userId sea un numero entero positivo
    if (isNaN(userId) || userId <= 0) {
        res.status(400).json({ error: "El ID del usuario no es un numero entero positivo valido" });
        return;
    }

    // Validar que el ID del usuario sea obligatorio
    if (!userId) {
        res.status(400).json({ error: "El ID del usuario es obligatorio" });
        return;
    }

    // Consultar el usuario existente
    const userExists = await pool.query('SELECT * FROM usuarios WHERE usuarioid = $1', [userId]);

    // Verificar si el usuario existe
    if (userExists.rowCount === 0) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
    }

    // Arreglos para almacenar los nuevos valores y nombres de columnas
    const updateValuesUsuarios = [];
    const updateColumnsUsuarios = [];

    // Validar y agregar nuevos valores en la tabla "usuarios" si corresponde
    if (cedula) {
        // No es necesario validar cedula como numero entero si es varchar
        const hashedCedula = await bcrypt.hash(cedula, saltRounds);
        updateValuesUsuarios.push(hashedCedula);
        updateColumnsUsuarios.push('cedula');
    }

    if (nombres !== undefined) {
        updateValuesUsuarios.push(nombres);
        updateColumnsUsuarios.push('nombres');
    }

    if (apellidos !== undefined) {
        updateValuesUsuarios.push(apellidos);
        updateColumnsUsuarios.push('apellidos');
    }

    if (tipousuario !== undefined && (tipousuario === "Administrador" || tipousuario === "Mesero")) {
        updateValuesUsuarios.push(tipousuario);
        updateColumnsUsuarios.push('tipousuario');
    }

    // Si updateValuesUsuarios esta vacío, significa que no hay cambios que realizar en la tabla "usuarios".
    if (updateValuesUsuarios.length === 0) {
        res.status(400).json({ error: 'Ningun campo para actualizar proporcionado' });
        return;
    }

    // Agregar userId al arreglo updateValuesUsuarios para identificar al usuario a actualizar en la tabla "usuarios"
    updateValuesUsuarios.push(userId);

    // Construir la consulta SQL dinamicamente para la actualización en la tabla "usuarios"
    const updateSetUsuarios = updateColumnsUsuarios.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const queryUsuarios = `UPDATE usuarios SET ${updateSetUsuarios} WHERE usuarioid = $${updateValuesUsuarios.length}`;

    // Realizar la actualización en la tabla "usuarios"
    const respuestaUsuarios = await pool.query(queryUsuarios, updateValuesUsuarios);

    if (respuestaUsuarios.rowCount === 1) {
        res.status(200).json({ message: 'Usuario actualizado con éxito' });
    } else {
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
};



// deleteUsuario

const deleteUsuario = async (req, res) => {
    const userId = req.params.id; // Capturamos el ID del usuario que deseas eliminar

    // Validar que el ID del usuario sea obligatorio
    if (!userId) {
        res.status(400).json({ error: "El ID del usuario es obligatorio" });
        return;
    }

    // Validar que userId sea un numero entero positivo
    if (isNaN(userId) || parseInt(userId) <= 0) {
        res.status(400).json({ error: "El ID del usuario no es un numero entero positivo valido" });
        return;
    }

    // Verificar si el usuario existe
    const userExists = await pool.query('SELECT * FROM usuarios WHERE usuarioid = $1', [userId]);

    if (userExists.rowCount === 0) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
    }

    // Verificar si existen registros en la tabla "datosacceso" relacionados con el usuario
    const dataAccessRecords = await pool.query('SELECT * FROM datosacceso WHERE usuarioid = $1', [userId]);

    if (dataAccessRecords.rowCount > 0) {
        // Si existen registros en "datosacceso" relacionados con el usuario, eliminarlos primero
        const deleteDataAccessQuery = 'DELETE FROM datosacceso WHERE usuarioid = $1';
        const deleteDataAccessResult = await pool.query(deleteDataAccessQuery, [userId]);

        if (deleteDataAccessResult.rowCount !== dataAccessRecords.rowCount) {
            res.status(500).json({ error: 'Error al eliminar los registros de datos de acceso' });
            return;
        }
    }

    // Eliminar al usuario de la tabla "usuarios" una vez que no haya registros relacionados en "datosacceso"
    const deleteUsuarioQuery = 'DELETE FROM usuarios WHERE usuarioid = $1';
    const deleteUsuarioResult = await pool.query(deleteUsuarioQuery, [userId]);

    if (deleteUsuarioResult.rowCount === 1) {
        res.status(200).json({ message: 'Usuario eliminado con éxito' });
    } else {
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};





module.exports = {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    // updateUsuarioCualquierCosa,
    deleteUsuario
};











// // Crear Usuario y datosacceso

// const bcrypt = require('bcrypt'); // Importamos el modulo bcrypt. 
// const saltRounds = 10; // Numero de rondas de sal para el hashing

// const createUsuario = async (req, res) => {
//     const { cedula, nombres, apellidos, tipousuario } = req.body;

//     if (cedula === "" || nombres === "" || apellidos === "" || tipousuario === "") {
//         res.status(400).json({ error: "Ausencia de datos" });
//     } else {
//         if (tipousuario === "Administrador" || tipousuario === "Mesero") {
//             try {
//                 // Generar un hash de la cédula
//                 const hashedCedula = await bcrypt.hash(cedula, saltRounds);

//                 const respuesta = await pool.query('INSERT INTO usuarios (cedula, nombres, apellidos, tipousuario) VALUES ($1, $2, $3, $4)', [hashedCedula, nombres, apellidos, tipousuario]);

//                 if (respuesta.rowCount === 1) {
//                     res.status(201).json({ message: 'Usuario creado con éxito' });
//                 } else {
//                     res.status(500).json({ error: 'Error al insertar usuario' });
//                 }
//             } catch (error) {
//                 console.error(error);
//                 res.status(500).json({ error: 'Error al crear el usuario' });
//             }
//         } else {
//             res.status(400).json({ error: 'tipousuario no valido' });
//         }
//     }
// };





















// const updateUsuario = async (req, res) => {
//     const userId = req.params.id; // Capturamos el ID del usuario de la URL
//     const { cedula, nombres, apellidos, tipousuario } = req.body;

//     if (!userId) {
//         res.status(400).json({ error: "El ID del usuario es obligatorio" });
//         return;
//     }

//     // Consultar el usuario existente
//     const userExists = await pool.query('SELECT * FROM usuarios WHERE usuarioid = $1', [userId]);

//     if (userExists.rowCount === 0) {
//         res.status(404).json({ error: 'Usuario no encontrado' });
//         return;
//     }

//     // Arreglos para almacenar los nuevos valores y nombres de columnas
//     const updateValues = [];
//     const updateColumns = [];

//     // Bloques condicionales para verificar y agregar nuevos valores
//     if (cedula) {
//         const hashedCedula = await bcrypt.hash(cedula, saltRounds);
//         updateValues.push(hashedCedula);
//         updateColumns.push('cedula');
//     }
//     if (nombres !== undefined) {
//         updateValues.push(nombres);
//         updateColumns.push('nombres');
//     }

//     if (apellidos !== undefined) {
//         updateValues.push(apellidos);
//         updateColumns.push('apellidos');
//     }

//     if (tipousuario !== undefined && (tipousuario === "Administrador" || tipousuario === "Mesero")) {
//         updateValues.push(tipousuario);
//         updateColumns.push('tipousuario');
//     }

//     // Si updateValues esta vacío, significa que no hay cambios que realizar.
//     if (updateValues.length === 0) {
//         res.status(400).json({ error: 'Ningun campo para actualizar proporcionado' });
//         return;
//     }

//     // Agregar userId al arreglo updateValues para identificar al usuario a actualizar
//     updateValues.push(userId);

//     // Construir la consulta SQL dinamicamente
//     const updateSet = updateColumns.map((col, i) => `${col} = $${i + 1}`).join(', ');
//     const query = `UPDATE usuarios SET ${updateSet} WHERE usuarioid = $${updateValues.length}`;

//     // Realizar la actualización en la base de datos
//     const respuesta = await pool.query(query, updateValues);

//     if (respuesta.rowCount === 1) {
//         res.status(200).json({ message: 'Usuario actualizado con éxito' });
//     } else {
//         res.status(500).json({ error: 'Error al actualizar el usuario' });
//     }
// }