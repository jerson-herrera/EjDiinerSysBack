const { Router } = require('express');
const routerProductos = Router();

const { getProductos, getProductoById, createProducto, deleteProducto} = require('../controllers/productos');

routerProductos.get('/getAllProductos',                       getProductos                     );
routerProductos.get('/getProducto/:id',                       getProductoById                  ); 
routerProductos.post('/createProducto',                       createProducto                   ); 
// routerProductos.put('/updateProducto/:id',                 updateProducto                   ); 
routerProductos.delete('/deleteProducto/:id',                 deleteProducto                   );



module.exports = routerProductos; 