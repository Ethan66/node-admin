const mongoose = require('mongoose')
const Schema = mongoose.Schema
const menuSchema = new Schema({
  roleId: {
    type: Number,
    unique: true,
    required: true
  },
  roleName: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: 1
  },
  delete: {
    type: Number,
    default: 0
  },
  updateDate: String,
  operator: String
}, { 
  collection: 'role', // 集合表
  versionKey: false // 不需要 __v 字段，默认是加上的
})

module.exports = mongoose.model('role', menuSchema)
