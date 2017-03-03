var express = require('express');
var models = require("../db/model");
var markdown = require('markdown').markdown;
//加载express的路由模块
var router = express.Router();

/* 指向首页*/
router.get('/', function(req, res, next) {
  
  // models.Article.find({}).populate('user').exec(function(err, articles) {
    //
    // articles.forEach(function (art) {
    //     //把markdown格式的文本转换成html输出
    //     art.content =  markdown.toHTML(art.content);
    //
    // });
    //
    // res.render('index', { title: 'zking博客',articles:articles});

    res.redirect('/article/list/1/2');


  // })


});

module.exports = router;
