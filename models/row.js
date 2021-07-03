const { Schema, model } = require('mongoose')
const row = new Schema({}, { strict: false })
let Row = model('Row', row, 'final_report')
module.exports = Row