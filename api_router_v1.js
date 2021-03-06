var express           = require('express');
var sign = require('./api/v1/sign');
var topicController   = require('./api/v1/topic');
var topicCollectController   = require('./api/v1/topic_collect');
var userController    = require('./api/v1/user');
var toolsController   = require('./api/v1/tools');
var replyController   = require('./api/v1/reply');
var messageController = require('./api/v1/message');
var middleware        = require('./api/v1/middleware');
var limit             = require('./middlewares/limit');
var config            = require('./config');

var router            = express.Router();

// sign controller
if (config.allow_sign_up) {
    // router.get('/signup', sign.showSignup);  // 跳转到注册页面
    router.post('/signup', sign.signup);  // 提交注册信息
} else {
    // 进行github验证

}


router.post('/signout', sign.signout);  // 登出
//router.get('/signin', sign.showLogin);  // 进入登录页面
router.post('/signin', sign.login);  // 登录校验
router.get('/active_account', sign.activeAccount);  //帐号激活



//router.get('/search_pass', sign.showSearchPass);  // 找回密码页面
router.post('/search_pass', sign.updateSearchPass);  // 更新密码
router.get('/reset_pass', sign.resetPass);  // 进入重置密码页面
router.post('/reset_pass', sign.updatePass);  // 更新密码

// 主题
router.get('/topics', topicController.index);
router.get('/topic/:id', middleware.tryAuth, topicController.show);
router.post('/topics', middleware.auth, limit.peruserperday('create_topic', config.create_post_per_day, {showJson: true}), topicController.create);
router.post('/topics/update', middleware.auth, topicController.update);


// 主题收藏
router.post('/topic_collect/collect', middleware.auth, topicCollectController.collect); // 关注某话题
router.post('/topic_collect/de_collect', middleware.auth, topicCollectController.de_collect); // 取消关注某话题
router.get('/topic_collect/:loginname', topicCollectController.list);

// 用户
router.get('/user/:loginname', userController.show);
router.post('/user/avatar/update', middleware.auth, userController.avatarUpload);


// accessToken 测试
router.post('/accesstoken', middleware.auth, toolsController.accesstoken);

// 评论
router.post('/topic/:topic_id/replies', middleware.auth, limit.peruserperday('create_reply', config.create_reply_per_day, {showJson: true}), replyController.create);
router.post('/reply/:reply_id/ups', middleware.auth, replyController.ups);

// 通知
router.get('/messages', middleware.auth, messageController.index);
router.get('/message/count', middleware.auth, messageController.count);
router.post('/message/mark_all', middleware.auth, messageController.markAll);
router.post('/message/mark_one/:msg_id', middleware.auth, messageController.markOne);

module.exports = router;
