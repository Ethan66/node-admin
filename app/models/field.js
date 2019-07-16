const mongoose = require('mongoose')
const Schema = mongoose.Schema
const fieldSchema = new Schema({
}, { 
  collection: 'field', // 集合表
  versionKey: false // 不需要 __v 字段，默认是加上的
})

module.exports = mongoose.model('field', fieldSchema)
