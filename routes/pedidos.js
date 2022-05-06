const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool

router.get('/', (req,res,next)=>{
    mysql.getConnection((error, conn)=>{
        if(error) {
            return res.status(500).send({ error: error})
        }
            conn.query(
                `SELECT pedidos.id_pedido,
                    pedidos.quantidade,
                    produtos.id_produtos, 
                    produtos.nome, 
                    produtos.preco
                FROM
                    pedidos
            INNER JOIN produtos
                    ON produtos.id_produtos = pedidos.id_produto`,
            (error, result, fields) => {
                if(error) {
                    return res.status(500).send({ error: error})
                }
                const response = {
                    quantidade_pedidos: result.length,
                    pedidos: result.map(prod => {
                        return {
                            id_pedido: prod.id_pedido,
                            quantidade: prod.quantidade,
                            produto: {
                                id_produto: prod.id_produtos,
                                nome: prod.nome,
                                preco: prod.preco
                            },
                            request:{
                                tipo: "GET",
                                descricao: "Retorna os detalhes de um pedido especifico",
                                url: "http://localhost:3000/produtos/" + prod.id_pedido
                            }
                        }
                    })
                }
                 return res.status(200).send({response})
            }
        )
    })
});


router.post('/', (req,res,next)=>{
    mysql.getConnection((error, conn)=>{
        if(error) {
            return res.status(500).send({ error: error})
        }
        conn.query(
            'INSERT INTO pedidos (id_produto,quantidade) values (?,?)',
            [req.body.id_produto, req.body.quantidade],
            (error, result, fields) => {
                if(error) {
                    return res.status(500).send({ error: error})
                } 
                const response = {
                    mensagem: 'Pedido criado com sucesso',
                    pedido_criado: {
                        id_pedido: result.id_pedido,
                        id_produto: req.body.id_produto,
                        quantidade: req.body.quantidade,
                        request: {
                            tipo: 'POST',
                            descricao: 'Retorna todos os pedidos',
                            url: 'http://localhost:3000/pedidos'
                        }
                    }
                }
                 return res.status(200).send({response})
            }
        )
    })
});

router.delete('/', (req,res,next)=>{
    mysql.getConnection((error, conn)=>{
        if(error) {
            return res.status(500).send({ error: error})
        }
        conn.query(
            'DELETE FROM pedidos WHERE id_pedido = ?',
            [req.body.id_pedido],
            (error, result, fields) => {
                if(error) {
                    return res.status(500).send({ error: error})
                } 
                const response = {
                    mensagem: 'Pedido excluido com sucesso',
                    pedido_criado: {
                        request: {
                            tipo: 'POST',
                            descricao: 'Insere um pedido',
                            body: {
                                id_produto: 'number',
                                quantidade: 'number'
                            },
                            url: 'http://localhost:3000/pedidos'
                        }
                    }
                }
                 return res.status(200).send({response})
            }
        )
    })
});

router.patch('/', (req,res,next)=>{
    mysql.getConnection((error, conn)=>{
        if(error) {
            return res.status(500).send({ error: error})
        }
        conn.query(
            'UPDATE pedidos set id_produto = ?, quantidade = ? WHERE id_pedido = ?',
            [req.body.id_produto, req.body.quantidade, req.body.id_pedidos],
            (error, result, fields) => {
                if(error) {
                    return res.status(500).send({ error: error})
                } 
                const response = {
                    mensagem: 'Pedido atualizado com sucesso',
                    pedido_criado: {
                        id_pedido: req.body.id_pedido,
                        id_produto: req.body.id_produto,
                        quantidade: req.body.quantidade,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os pedidos',
                            url: 'http://localhost:3000/pedidos'
                        }
                    }
                }
                 return res.status(200).send({response})
            }
        )
    })
});




module.exports = router