const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

router.post('/cadastro', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error })
        }
        conn.query('select *from usuarios where email = ?', [req.body.email], (error, results) => {
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length > 0) {
                res.status(401).send({ mensagem: 'Usuario já cadastrado' })
            }
            bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                if (errBcrypt) { return res.status(500).send({ error: errBcrypt })}
                conn.query(
                    'INSERT INTO usuarios (email, senha) VALUES (?,?)',
                    [req.body.email, hash ],
                    (error, result) =>{
                        conn.release()
                        if(error) {
                           return res.status(500).send({
                                error: error,
                                response: null
                            })
                        }
                        const response = {
                            mensagem: 'Usuario criado com sucesso',
                            usuarioCriado: {
                                id_usuario: result.insertId,
                                email: req.body.email
                            }
                        }
                        res.status(201).send({ response })
                    }
                )
            })
        })
    })
})

router.post('/login', (req,res, next) =>{
    mysql.getConnection((error, conn)=>{
        if(error) { return res.status(500).send({error: error})}
        const query = 'SELECT *FROM usuarios WHERE email = ?'
        conn.query(query,[req.body.email], (error, results, fields) =>{
            conn.release()
            if(error) {return res.status(500).send({error: error})}
            if (results.length < 1) {
                return res.status(401).send({mensagem: 'Falha na autenticação'})
            }
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) =>{
                if (err) {
                    return res.status(401).send({mensagem: "Falha na autenticação"})
                }
                if (result){
                    const token = jwt.sign({
                        id_usuario: results[0].id_usuario,
                        email:results[0].email
                    },
                     process.env.JWT_KEY,{
                         expiresIn: "1h"
                     })
                     return res.status(200).send({
                         mensagem: 'Autencado com sucesso',
                         token: token})
                }
                return res.status(401).send({mensagem: "Falha na autenticação"})
            })
        })
    })
})

module.exports = router


