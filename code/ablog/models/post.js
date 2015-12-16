/**
 * Created by code_joursion on 15-11-30.
 */
var crypto = require('crypto');
var mongoose = require('mongoose');
var markdown = require('markdown').markdown;
//mongoose.connect('mongodb://localhost/posts');

var postSchema = new mongoose.Schema({
    name: String,
    title: String,
    post: String,
    year: String,
    month: String,
    day: String,
    minute: String,
    comments: []
},{
    collection: 'posts'
});

var postModel = mongoose.model('Post', postSchema);

function Post(name, title, post, year) {
    this.name = name;
    this.title = title;
    this.post = post;
    this.year = year;
}

Post.prototype.save = function(callback) {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getFullYear() + "-" + (date.getMonth() + 1);
    var day = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    var minute = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var post = {
        name: this.name,
        date: this.date,
        year: this.year,
        month: month,
        day : day,
        minute: minute,
        title: this.title,
        post: this.post,
        comments: []
    };

    var newPost = new postModel(post);
    newPost.save(function (err, post) {
        if (err) {
            console.log(err + 'save error');
            return callback(err);
        }
        console.log('posts save success');
        callback(null, post);
    });
/*
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            collection.insert(post, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null);//返回 err 为 null
            });
        });
    });*/
};

Post.getAll = function(name, callback) {
    postModel.find({name : name}, function (err, docs) {
        if (err) {
            return callback(err);
        }
        docs.forEach(function (doc) {
            doc.post = markdown.toHTML(doc.post);
        })
        callback(null, docs);
    });
   /* mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null, docs);//成功！以数组形式返回查询的结果
            });
        });
    });*/
};

Post.getOne = function (name, day, title, callback) {
    postModel.findOne({name : name, day: day, title: title}, function (err, docs) {
        if(err) {
            return callback(err);
        }
        if (docs) {
            docs.post = markdown.toHTML(docs.post);
          /*  docs.comments.forEach(function (comment) {
                comment.content = markdown.toHTML(comment.content);
            });*/
            if(docs.comments) {
                docs.comments = markdown.toHTML(docs.comments);
            }
        }
       // docs.post = markdown.toHTML(docs.post);
        callback(null, docs);
    })
};

Post.edit = function (name, day, title, callback) {
    postModel.findOne({name : name, day: day, title: title}, function (err, docs) {
        if(err) {
            return callback(err);
        }
        //docs.post = markdown.toHTML(docs.post);
        callback(null, docs);
    })
};

Post.update = function (name, day, title, post, callback) {
    postModel.update({name : name, day: day, title: title}, {post : post}, function (err) {
        if(err) {
            return callback(err);
        }
        callback(null);
    })
};


Post.remove = function (name, day, title, callback) {
    postModel.remove({name : name, day: day, title: title}, function (err) {
        if(err) {
            return callback(err);
        }
        callback(null);
    })
};

Post.push = function (name, day, title, comment, callback) {
    postModel.push({name : name, day: day, title: title},{comments: comment}, function (err) {
        if(err) {
            return callback(err);
        }
        callback(null);
    })
};


module.exports = Post;