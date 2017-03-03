/**
 * Created by maggie on 16/11/16.
 */
var express = require('express');
var models = require("../db/model");
var utils = require('../utils');
var auth = require('../middleware/autoauth');
var markdown = require('markdown').markdown;
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.redirect('/article/list/1/2');
});

// 添加文章  http://127.0.0.1:3000/article/add
router.get('/post', auth.checkLogin, function (req, res, next) {
    res.render('articles/post.html', {title: '发布文章'});
});
router.post('/post', auth.checkLogin, function (req, res, next) {

    var article = req.body;
    models.Article.create({
        title: article.title,
        content: article.content,
        user: req.session.user._id
    }, function (err, art) {
        if (err) {
            req.flash('error', '发布失败,请稍后再试');
            res.redirect("/article/post");
        } else {
            console.log(art);
            req.flash('success', '发布成功');
            res.redirect("/");
        }

    })

});


router.get('/detail/:id', function (req, resp, next) {


    //console.log(req.params);

    models.Article.findById(req.params.id).populate('user').exec(function (err, art) {
        console.log(art);
        art.content = markdown.toHTML(art.content);
        resp.render('articles/detail.html', {title: '文章详情', article: art});

    })
});

//查看文章的路由
router.get('/view', function (req, res, next) {
    res.send('查看文章');
});

//   get  /articles/list/3/2 没有搜索关键字
//   post /articles/list/3/2 有搜索关键字
router.all('/list/:pageNum/:pageSize', function (req, res, next) {
    var searchBtn = req.query.searchBtn;
    var pageNum = req.params.pageNum && req.params.pageNum > 0 ? parseInt(req.params.pageNum) : 1;
    var pageSize = req.params.pageSize && req.params.pageSize > 0 ? parseInt(req.params.pageSize) : 2;
    var query = {};
    var keyword = req.query.keyword;

    console.log("keyword="+keyword);
    //如果点击的是搜索按钮就会有 搜索关键字
    if(searchBtn){
        //那么就应该吧搜索关键字放到sessions中 这样换页时,搜索关键字就不会丢失
        console.log("kkkkkk");
        req.session.keyword = keyword;
    }
    if(keyword){
        query['title'] = new RegExp(req.session.keyword,"i");
    }

    // if (keyword) {
    //     //设置查询条件
    //     query['title'] = new RegExp(keyword, 'ig');
    // }



    console.log("pageNum="+pageNum+" pageSize="+pageSize);
    //查询这个关键字的结果一共有多少条
    models.Article.count(query, function (err, count) {

        console.log('count='+count+"  pageNum="+(pageNum-1)*pageSize);
        //查询复合关键字的当前页数据
        models.Article.find(query)
            .sort({'createTime' : -1})
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
            .populate('user')
            .exec(function (err, articles) {

                console.log(articles);
                //将数据渲染到首页
                res.render('index.html',
                    {
                        title:'主页',
                        articles: articles,//保存了页面要显示的数据
                        count: count,//查询出的数据一共有多少条
                        pageNum:pageNum,//当前是第几页
                        pageSize:pageSize,//一共有多少页
                        keyword:keyword
                    });

            });
    })
});

module.exports = router;
