const mongoose = require('mongoose')
const Schema = mongoose.Schema
const menuSchema = new Schema({
  id: {
    type: Number,
    unique: true,
    required: true
  },
  roleName: {
    type: String,
    required: true
  },
  delete: {
    type: Number,
    default: 0
  }
}, { 
  collection: 'role', // 集合表
  versionKey: false // 不需要 __v 字段，默认是加上的
})

module.exports = mongoose.model('role', menuSchema)
