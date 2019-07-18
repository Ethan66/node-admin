const mongoose = require('mongoose')
const Schema = mongoose.Schema
const menuSchema = new Schema({
  id: {
    type: Number,
    unique: true,
    required: true
  },
  code: {
    type: String,
    unique: true,
    required: true
  },
  menuName: {
    type: String,
    required: true
  },
  menuLevel: {
    type: Number,
    required: true
  },
  menuParentId: {
    type: Number,
    required: true
  },
  menuType: {
    type: Number,
    required: true
  },
  menuUrl: {
    type: String,
    default: ''
  },
  menuIcon: {
    type: String,
    default: ''
  },
  sortNo: {
    type: Number,
    default: 1
  },
  status: {
    type: Number,
    default: 1
  },
  delete: {
    type: Number,
    default: 0
  }
}, { 
  collection: 'menu', // 集合表
  versionKey: false // 不需要 __v 字段，默认是加上的
})

module.exports = mongoose.model('menu', menuSchema)
