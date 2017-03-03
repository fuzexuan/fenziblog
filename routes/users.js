var express = require('express');
var models = require("../db/model");
var path = require('path');
var router = express.Router();
var utils= require('../utils');
var multer = require('multer');
var auth = require('../middleware/autoauth');


var storage = multer.diskStorage({
    //设定上传文件的保存路径
    destination: function (req, file, cb) {
        cb(null, '../public/uploads')
    },
    //设定上传文件的文件名
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, Date.now()+'.'+file.mimetype.slice(file.mimetype.indexOf('/')+1))
    }
})

var upload = multer({ storage:storage});


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
// http:/127.0.0.1:3000/users/reg
router.get('/reg',auth.checkNotLogin, function(req, res, next) {
  res.render('users/reg.html', { title: '用户注册'});
});

//路径与上面访问注册页面的路径是一致的,只是动作是post
//这种设计即是RESTful设计原则
//上传头像必须要加upload.single中间件  single方法处理上传单个文件,其参数是表单中file input框的name属性值
router.post('/reg',auth.checkNotLogin,upload.single('avatar'),function (req,res,next) {
    //获取表单数据
      var user = req.body;
      if(user.pwd === user.pwd2)
      {
          models.User.findOne({username:user.username},function (err,doc) {
              if(doc)
              {//如果有值,用户名已存在
                  req.flash('error','用户名已存在请重新注册');
                  res.redirect('/users/reg');
              }else
              {

                  //查看头像是否有值
                  if(req.file)
                  {
                      console.log(req.file);
                      //如果存在则文件上传成功
                     user.avater = path.join('/uploads',req.file.filename);
                  }else
                  {
                      //如果没有上传头像 则用email地址的头像
                      user.avater =  'https://s.gravatar.com/avatar/'+utils.md5(user.email)+'?s=40'
                  }

                  //没有值才能够注册
                  models.User.create(
                      //脱库攻击
                      {username:user.username,
                          password:utils.md5(user.pwd),
                          email:user.email,
                          avatar:user.avater}, function (err,doc) {
                          if(err)
                          {
                              req.flash('error','注册失败,请稍后再试');
                              res.redirect('/users/reg');
                          }else
                          {
                              //注册成功,重定向到登陆页面
                              req.flash('success','注册成功请登陆');
                              res.redirect("/users/login");
                          }

                      })
              }
          })
      }else
      {
          //2次密码不一致
          req.flash('error','密码和确认密码不一致');
          res.redirect('/users/reg');
      }
});

router.get('/login',auth.checkNotLogin, function(req, res, next) {
  res.render('users/login.html', { title: '用户登录'});
});

router.post('/login',auth.checkNotLogin, function(req, res, next) {

    //获取表单数据
    var user = req.body;
    
    models.User.findOne({username:user.username,
        password: utils.md5(user.pwd)
    },function (err,doc) {
          if(doc)
          {
              //若果doc存在,那么就是登陆成功
              //登陆成功后,将用户的信息放入session保存

              req.session.user = doc;
            //重定向  是由服务器端向客户端浏览器发出状态是301/302的响应码 告诉客户端浏览器要发出新的请求,地址是 "/"也就是网站的根目录
              //  A页面--->B页面--->C页面
              //转发  forward
              // A页面---》B页面---》c页面

              //放入成功的消息
              req.flash("success",'登陆成功');
              res.redirect("/");
          }else
          {
              //如果doc不存在,那么就是登陆失败
              //放入失败的消息
              req.flash("error",'登陆失败,用户名或密码错');
              res.redirect("/users/login");
          }

    })
});

//退出登录
router.get('/loginout',auth.checkLogin, function(req, res, next) {
    req.session.user=null;
    res.redirect("/");
});


module.exports = router;
