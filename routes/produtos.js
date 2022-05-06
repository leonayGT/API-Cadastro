const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
    cb(null, file.originalname)}
})

const fileFilter = (req, file,cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    } else{
        cb(null, true)
    } 
}
const upload = multer({
     storage: storage,
     limits: {
         fileSize: 1024 * 1024 * 5
     },
     fileFilter: fileFilter
})

router.get('/', (req,res,next)=>{
    mysql.getConnection((error, conn)=>{
        if(error) {
            return res.status(500).send({ error: error})
        }
        conn.query(
            'SELECT *from produtos',
            (error, result, fields) => {
                if(error) {
                    return res.status(500).send({ error: error})
                } 
                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod => {
                        return {
                            id_produto: prod.id_produtos,
                            nome: prod.nome,
                            preco: prod.preco,
                            request:{
                                tipo: "GET",
                                descricao: "Retorna os detalhes de um produto especifico",
                                url: "http://localhost:3000/produtos/" + prod.id_produtos
                            }
                        }
                    })
                }
                 return res.status(200).send({response})
                
            }
        )
        
    })
});

router.post('/', upload.single('produto_imagem'), (req,res, next)=>{
    console.log(req.file)
    mysql.getConnection((error, conn)=>{
      if(error) {
        return res.status(500).send({error: error})
      } 
        conn.query(
            'INSERT INTO produtos (nome, preco, imagem_produto) VALUES (?,?,?)',
            [req.body.nome, req.body.preco, req.file.path ],
            (error, result, fields) =>{
                conn.release()
                if(error) {
                   return res.status(500).send({
                        error: error,
                        response: null
                    })
                }
                const response = {
                    mensagem: 'Produto inserido com sucesso',
                    produtoCriado: {
                        id_produto: result.id_produto,
                        nome: req.body.nome,
                        imagem: req.file.path,
                        preco: req.body.preco,
                        request: {
                            tipo: 'POST',
                            descricao: 'Retorna todos os produtos',
                            url: 'http://localhost:3000/produtos'
                        }
                    }
                }
                res.status(201).send({ response })
            }
        )
    })
})

router.patch('/', (req,res, next)=>{
    mysql.getConnection((error, conn)=>{
        if(error) {
          return res.status(500).send({error: error})
        } 
          conn.query(
              `UPDATE produtos SET nome = ?, preco = ? WHERE id_produtos = ?;`,
              [req.body.nome, req.body.preco, req.body.id_produtos],
              (error, result, fields) =>{
                  conn.release()
                  if(error) {
                     return res.status(500).send({
                          error: error,
                          response: null
                      })
                  }
                  const response = {
                    mensagem: 'Produto atualizado com sucesso',
                    ProdutoAtualizado: {
                        id_produto: req.body.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os produtos',
                            url: 'http://localhost:3000/produtos/'+ req.body.id_produtos
                        }
                    }
                }
                  res.status(202).send({ response })
              }
          )
      })
  })
  
  router.delete('/', (req,res, next)=>{
    mysql.getConnection((error, conn)=>{
        if(error) {
          return res.status(500).send({error: error})
        } 
          conn.query(
              `DELETE FROM produtos WHERE id_produtos = ?;`,
              [req.body.id_produtos],
              (error, result, fields) =>{
                  conn.release()
                  if(error) {
                     return res.status(500).send({
                          error: error,
                          response: null
                      })
                  }
                  const response = {
                    mensagem: 'Produto removido com sucesso',              
                        request: {
                            tipo: 'POST',
                            descricao: 'Insere um produto',
                            url: 'http://localhost:3000/produtos/',
                            body: {
                                nome: 'string',
                                preco: 'number'
                            }
                        }
                }
                  res.status(202).send({ response })
              }
          )
      })
  })

router.get('/:id_produto', (req,res,next)=>{
    mysql.getConnection((error, conn)=>{
        if(error) {
            return res.status(500).send({ error: error})
        }
        conn.query(
            'SELECT *from produtos WHERE id_produtos = ?',
            [req.params.id_produto],
            (error, result, fields) => {
                if(error) {
                    return res.status(500).send({ error: error})
                } 
                if(result.length == 0){
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado produto com este ID'
                    })
                }
                const response = {
                    mensagem: 'Produto inserido com sucesso',
                    Produto: {
                        id_produto: result[0].id_produtos,
                        nome: result[0].nome,
                        preco: result[0].preco,
                        imagem_produto: 'localhost:3000/' + result[0].imagem_produto,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os produtos',
                            url: 'http://localhost:3000/produtos'
                        }
                    }
                }
                return res.status(200).send({ response })
            }
        )
        
    })
});

module.exports = router