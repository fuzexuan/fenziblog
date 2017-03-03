/**
 * Created by maggie on 16/11/17.
 */
var mongoose = require('mongoose');
var dbconfig = require('../dbconfig.js');

var ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect(dbconfig.dburl);
//创建数据库模型
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: {type: String, default: ''},
    avatar: {type: String},
    createTime:{type:Date,default:Date.now}
});

var articleSchema = new mongoose.Schema({
    title: String,
    //user属性是userinfo表的用户id,所以类型应该是ObjectId,为了表现之间的关联关系要使用ref属性
    user: {type:ObjectId,ref:"userinfo"},
    content: String,
    createTime:{type:Date,default:Date.now}
});

exports.User = mongoose.model('userinfo', userSchema);
exports.Article = mongoose.model('article', articleSchema);

