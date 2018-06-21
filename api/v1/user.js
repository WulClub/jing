var _            = require('lodash');
var eventproxy   = require('eventproxy');
var UserProxy    = require('../../proxy').User;
var TopicProxy   = require('../../proxy').Topic;
var ReplyProxy   = require('../../proxy').Reply;
var TopicCollect = require('../../proxy').TopicCollect;

var store        = require('../../common/store');

var show = function (req, res, next) {
  var loginname = req.params.loginname;
  var ep        = new eventproxy();

  ep.fail(next);

  UserProxy.getUserByLoginName(loginname, ep.done(function (user) {
    if (!user) {
      res.status(404);
      return res.send({success: false, error_msg: '用户不存在'});
    }
    var query = {author_id: user._id};
    var opt = {limit: 15, sort: '-create_at'};
    TopicProxy.getTopicsByQuery(query, opt, ep.done('recent_topics'));

    ReplyProxy.getRepliesByAuthorId(user._id, {limit: 20, sort: '-create_at'},
      ep.done(function (replies) {
        var topic_ids = replies.map(function (reply) {
          return reply.topic_id.toString()
        });
        topic_ids = _.uniq(topic_ids).slice(0, 5); //  只显示最近5条

        var query = {_id: {'$in': topic_ids}};
        var opt = {};
        TopicProxy.getTopicsByQuery(query, opt, ep.done('recent_replies', function (recent_replies) {
          recent_replies = _.sortBy(recent_replies, function (topic) {
            return topic_ids.indexOf(topic._id.toString())
          });
          return recent_replies;
        }));
      }));

    ep.all('recent_topics', 'recent_replies',
      function (recent_topics, recent_replies) {

        user = _.pick(user, ['loginname', 'avatar_url', 'githubUsername',
          'create_at', 'score']);

        user.recent_topics = recent_topics.map(function (topic) {
          topic.author = _.pick(topic.author, ['loginname', 'avatar_url']);
          topic        = _.pick(topic, ['id', 'author', 'title', 'last_reply_at']);
          return topic;
        });
        user.recent_replies = recent_replies.map(function (topic) {
          topic.author = _.pick(topic.author, ['loginname', 'avatar_url']);
          topic        = _.pick(topic, ['id', 'author', 'title', 'last_reply_at']);
          return topic;
        });

        res.send({success: true, data: user});
      });
  }));
};

exports.show = show;

//上传头像
exports.avatarUpload = function (req, res, next) {
  var isFileLimit = false;
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      file.on('limit', function () {
        isFileLimit = true;

        res.json({
          success: false,
          msg: 'File size too large. Max is ' + config.file_limit
        })
      });

      store.upload(file, {filename: filename}, function (err, result) {
        if (err) {
          return next(err);
        }
        if (isFileLimit) {
          return;
        }
		 
	//保存头像地址	 
	var avatar = result.url;
	var ep        = new eventproxy();
     ep.fail(next);
	 console.log(req.session.user)
    UserProxy.getUserById(req.session.user._id, ep.done(function (user) {
      user.avatar = avatar;
       
      user.save(function (err) {
        if (err) {
          return next(err);
        }
        req.session.user = user.toObject({virtual: true});
        res.json({
          success: true,
          url: result.url,
        });
      });
    }));
        
      });

    });

  req.pipe(req.busboy);
};
