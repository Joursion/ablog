var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
//var Comment = require('../models/comment.js');

module.exports = function(app){
    app.get('/', function (req, res) {
        if(req.session.user){
            Post.getAll(req.session.user.name, function (err, posts) {
               console.log(posts);
                if(err) {
                    posts = [];
                    console.log(err);
                } else{
                    /* posts = [['title','ds'],['name','dsds'],['post','dsasda'],
                     ['time', 'time']
                     ];*/
                    //posts = [{name:'name', title:'title'},{}];
                    res.render('index', {
                        title: '主页',
                        user: req.session.user,
                        posts: posts,
                        success: req.flash('success').toString(),
                        error: req.flash('error').toString()
                    });
                }
            });
        } else {
            res.render('index', {
                title:'主页',
                user: 'null',
                posts: [],
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        }
    });
    app.get('/reg', checkNotLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/reg', checkNotLogin);
    app.post('/reg', function (req, res) {
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];
        //检验用户两次输入的密码是否一致
        if (password_re != password) {
            req.flash('error', '两次输入的密码不一致!');
            return res.redirect('/reg');//返回注册页
        }
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name: name,
            password: password,
            email: req.body.email
        });
        //检查用户名是否已经存在
        User.get(newUser.name, function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            if (user) {
                req.flash('error', '用户已存在!');
                return res.redirect('/reg');//返回注册页
            }
            //如果不存在则新增用户
            newUser.save(function (err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');//注册失败返回主册页
                }
                req.session.user = user;//用户信息存入 session
                req.flash('success', '注册成功!');
                res.redirect('/');//注册成功后返回主页
            });
        });
    });

    app.get('/login', checkNotLogin);
    app.get('/login', function (req,res) {
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login', function (req,res) {
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        User.get(req.body.name, function (err, user) {
            if(!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/login');
            }
            if (user.password != password) {
                res.flash('error', '密码错误');
                return res.redirect('/login');
            }
            req.session.user = user;
            console.log(req.session.user + '~~~~');
            req.flash('success', '登录成功');
            res.redirect('/');
        });
    });

    app.get('/post', checkLogin);
    app.get('/post', function (req, res) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/post', checkLogin);
    app.post('/post', function (req,res) {
        var currentUser = req.session.user;
        var post = new Post(currentUser.name, req.body.title, req.body.post);
       // console.log(currentUser.name + '' + req.body.title + '  ' + req.body.post);
        post.save(function (err, post) {
         //   console.log(post);
            if (err) {
                console.log('save error');
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', 'success');
            res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function (req,res) {
        req.session.user = null;
        req.flash('success', '登出成功');
        res.redirect('/');
    });

    app.get('/upload', checkLogin);
    app.get('/upload', function (req, res) {
        res.render('upload', {
            title: '文件上传',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/upload', function (req, res) {
        req.flash('success', '文件上传成功');
        res.redirect('/upload');
    });

    app.get('/u/:name', function (req, res) {
        console.log('name' + req.params.name);
        User.get(req.params.name, function (err, user) {
            if(!user) {
                req.flash('error', '用户不存在');
                return res.redirect('404');
            }

            Post.getAll(user.name, function (err, posts) {
                if(err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    user: req.session.user.name,
                    success : req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });

    app.get('/u/:name/:day/:title', function (req, res) {
        Post.getOne(req.params.name, req.params.day, req.params.title,
            function (err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('article', {
                    title: req.params.title,
                    post: posts,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
    });

    app.post('/u/:name/:day/:title', function (req, res) {
        var date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var comment = {
            name: req.body.name,
            email: req.body.email,
            website: req.body.website,
            time: time,
            content: req.body.content
        };
        var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
        newComment.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '留言成功!');
            res.redirect('back');
        });
    });

    app.get('/edit/:name/:day/:title', checkLogin);
    app.get('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            res.render('edit', {
                title: '编辑',
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.post('/edit/:name/:day/:title', checkLogin);
    app.post('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
            if (err) {
                req.flash('error', err);
                return res.redirect(url);
            }
            req.flash('success', '修改成功!');
            res.redirect(url);
        });
    });

    app.get('/remove/:name/:day/:title', checkLogin);
    app.get('/remove/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功!');
            res.redirect('/');
        });
    });

    app.post('/commit/:name/:day/:title',checkLogin);
    app.post('/commit/:name/:day/:title', function (req, res) {

    });

    function checkLogin(req, res, next ) {
        if (!req.session.user) {
            req.flash('error', '未登录');
            res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '以登录');
            res.direct('back');
        }
        next();
    }
};

