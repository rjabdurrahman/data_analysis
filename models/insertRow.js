const { Schema, model } = require('mongoose')
const row = new Schema({}, { strict: false })
let InsertRow = model('InsertRow', row, 'filtered_data')
module.exports = InsertRow