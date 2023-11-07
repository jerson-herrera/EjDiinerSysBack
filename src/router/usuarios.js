const { Router } = require('express'); 
const routerUsuarios = Router();

const { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario} = require('../controllers/usuarios');

routerUsuarios.get('/getAllUsuarios',                       getUsuarios                      );
routerUsuarios.get('/getUsuario/:id',                       getUsuarioById                   ); 
routerUsuarios.post('/createUsuario',                       createUsuario                    );
routerUsuarios.put('/updateUsuario/:id',                    updateUsuario                    );
routerUsuarios.delete('/deleteUsuario/:id',                 deleteUsuario                    );





module.exports = routerUsuarios; 