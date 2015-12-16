/**
 * Created by code_joursion on 15-12-1.
 */

var crypto = require('crypto');
var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    comments:[]
    /*comment_minute: String,
    comment_id: String,
    comment_email: Stirng*/
},{
    collection: 'posts'
});

function Comment(name, day, title, comment) {
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

var commentModel = mongoose.model('Comment', commentSchema);

Comment.prototype.save = function (name, day, title, comment, callback) {
    var comment_ = this.comment;
    var date = Date.now();
    //var minute = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        //date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

    var tmp_comment = {
        comment : comment_
        //comment_minute: minute
    };

    var newComment = new commentModel(tmp_comment);
    newComment.push({name: name, day : day, title: title }, function (err) {
        if(err) {
            return callback(err);
        }
        callback(null);
    });
};

module.exports = Comment;
