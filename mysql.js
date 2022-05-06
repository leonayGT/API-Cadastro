var mysql = require('mysql2')

var pool = mysql.createPool({
    host: 'localhost',
    user: 'leonaygt',
    password: '123456',
    database: 'ecommerce',
    port: 3306,
});
pool.query("SELECT *FROM pedidos",(err, rows, fields)=>{
    console.log('deu certo', rows)
})

module.exports = { pool }