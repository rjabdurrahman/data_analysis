const express = require('express');
const app = express();
const _ = require('lodash');
const mongoose = require('mongoose');
const db = mongoose.connection;
mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true });
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected!');
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.get('/analyze_import', (req, res) => {


  async function analyzeData() {
    let result = [];
    const Row = require('./models/row');
    let data = await Row.find({}).exec();
    let users = _.groupBy(JSON.parse(JSON.stringify(data)), function (d) { return d.TM_USER_NAME });
    for (user in users) {
      result.push({
        userId: user,
        q1_count: users[user].filter(x => x.q1).length,
        q4_count: users[user].filter(x => x.q4).length,
        q4_7_days: users[user].filter(x => x.q4 == '7 days').length
      });
    }
    // console.log('Total Data', data.length);
    // console.log('Unique Users', result.length);
    insertResult(result);
  }

  const InsertRow = require('./models/insertRow');
  function insertResult(data) {
    try {
      InsertRow.insertMany(JSON.parse(JSON.stringify(data)));
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