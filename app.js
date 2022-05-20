const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan')
const bodyParser = require('body-parser')
const rotaProdutos = require('./routes/produtos')
const rotaPedidos = require('./routes/pedidos')
const rotaUsuarios = require('./routes/usuarios')

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json()) //só aceita formato json


app.use('/uploads', express.static('uploads'))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Request-Width, Content-Type, Accept");
    app.use(cors());
    next();
});

app.use('/usuarios', rotaUsuarios)
app.use('/produtos', rotaProdutos)
app.use('/pedidos', rotaPedidos)

//tratar erro 400 quando não se encontra a rota
app.use((req, res, next)=>{
    const erro = new Error('Não encontrado');
    erro.status = 404
    next(erro)
});

//tratar erro 500 de servidor
app.use((error,req,res,next)=>{
    res.status(error.status || 500)
    return res.send({
        erro: {
            mensagem: error.message
        }
    });
});

module.exports = app;