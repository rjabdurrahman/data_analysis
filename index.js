const express = require('express');
const app = express();
const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017';

let reportCollection;
let questionResult;
MongoClient.connect(mongoUrl, {
  useUnifiedTopology: true
}, (err, client) => {
  if (err) return console.error(err)
  console.log('Connected to Database')
  const db = client.db('testdb')
  reportCollection = db.collection('final_report')
  questionResult = db.collection('question_result')
})

app.listen(3000, () => console.log('Listening on http://localhost:3000'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.get('/analyze_import/:target', (req, res) => {
  async function analyzeData() {
    let result = [];
    try {
      let data = await reportCollection.find({}).toArray();
      let users = _.groupBy(JSON.parse(JSON.stringify(data)), function (d) { return d.TM_USER_NAME });
      for (user in users) {
        result.push({
          userId: user,
          userName: users[user][0].TM_NAME,
          teritory: users[user][0].TERITORY_NAME,
          q1_count: users[user].filter(x => x.q1).length,
          q4_count: users[user].filter(x => x.q4).length,
          q4_7_days: users[user].filter(x => x.q4 == '7 days').length,
          target: req.params.target
        });
      }
      console.log('Total Data', data.length);
      console.log('Unique Users', result.length);
      insertResult(result);
    } catch (e) {
      console.log(e.message);
    }
  }

  async function insertResult(data) {
    try {
      await questionResult.insertMany(JSON.parse(JSON.stringify(data)));
      console.log('Inserted');
      res.send(`
      <h1>Imported Successfully.</h1>
      <h3> Please Check your DB</h3>
      `)
    } catch (e) {
      res.send('Error', e.message);
    }
  }

  analyzeData();
})