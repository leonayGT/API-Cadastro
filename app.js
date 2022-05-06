const express = require('express');
const app = express();
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const rotaProdutos = require('./routes/produtos')
const rotaPedidos = require('./routes/pedidos')

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json()) //só aceita formato json

app.use('/uploads', express.static('uploads'))
app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});

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