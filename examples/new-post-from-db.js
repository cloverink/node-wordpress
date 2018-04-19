const wordpress = require("../");
const mysql = require('promise-mysql');
const { log } = console

const wpClient = wordpress.createClient({
  url: "wordpress.com",
  username: "admin",
  password: "admin"
});


const connect = async() => {
  return await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'db'
  })
}

const disconnect = async (con) => {
  await con.end()
}

const getData = async() => {
  const con = await connect()
  const sql = 'select * from questions where flag = 1 limit 1'
  const res = await con.query(sql)
  await disconnect(con)
  return res
}

const saveData = async(qid) => {
  const con = await connect()
  const sql = `update questions set flag = 2 where qid = ${qid}`
  await con.query(sql)

  const sql2 = 'select count(*) cnt from questions where flag = 1'
  const x = await con.query(sql2)
  log('remain: ', x[0].cnt)

  await disconnect(con)
}

const getFullContent = (q, a, l) => {
  const question = `<h3 class="question">Question: ❓❓❓</h3><hr><br>${q}`
  const answer = `<br><hr><h3 class="answer">Good Answer: 👌👌👌</h3><br><br>${a}`
  const link = `<br><br><hr><span> Read More: 👉 <a href="${l}">${l}</a></span><br><br>`

  return `${question}${answer}${link}`
}

const run = async() => {
  const data = await getData()
  switch (data.length) {
    case 1:
      
      const { qid, title, name, url, votes, answers, tags, question_desc, answer_desc} = data[0]

      wpClient.newPost({
        title: title,
        content: getFullContent(question_desc, answer_desc, url),
        status: "publish",
        termNames: {
          "category": ["knowledge", "developer"],
          "post_tag": tags.split(',')
        }
      }, async(error, data) => {
        log('done',data, qid, name)
        await saveData(qid)
        run()
      });
      break;
    case 0:
    default:
      log('finish')
      break;
  }
}

run()