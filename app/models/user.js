const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
  userId: {
    type: Number,
    unique: true,
    required: true
  },
  user: {
    type: String,
    unique: true,
    required: true
  },
  userName: {
    type: String
  },
  delete: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 1
  },
  roleId: Number,
  roleName: String,
  ipAddress: String,
  operatingSystem: String,
  terminal: String,
  createTime: String,
  loginTime: String,
  errorCount: {
    type: Number,
    default: 0
  },
  errorTime: String,
  operator: String
}, { 
  collection: 'user', // 集合表
  versionKey: false // 不需要 __v 字段，默认是加上的
})

module.exports = mongoose.model('user', userSchema)
