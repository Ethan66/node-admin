const mongoose = require('mongoose')
const Schema = mongoose.Schema
const exampleSchema = new Schema({
  msg: {
    type: String,
    required: true
  },
}, { 
  collection: 'example2', // 集合表
  versionKey: false // 不需要 __v 字段，默认是加上的
})

module.exports = mongoose.model('example1', exampleSchema)
