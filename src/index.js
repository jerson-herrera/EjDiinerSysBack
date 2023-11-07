const express = require ('express'); 
const app = express();

const routerUsuarios = require('./router/usuarios');
const routerProductos = require('./router/productos');
// const routerPedidos = require('./router/pedidos');

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));



// Routes
app.use('/usuarios', routerUsuarios);
app.use('/productos', routerProductos);
// app.use('/ventas',routerPedidos);


const port = 3000;
app.listen(port, ()=>{
    console.log(`El servidor se esta ejecutando en el puerto: ${port}`)
    
});
