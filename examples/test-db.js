const mysql = require('promise-mysql');


const test = async () => {

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'testtable'
  })

  const sql = "select * from questions limit 1";
  const x = await connection.query(sql);

  console.log(x)

  await connection.end();
}


test();