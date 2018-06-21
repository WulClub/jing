var mongoose   = require('mongoose');
var UserModel  = mongoose.model('User');
var Message    = require('../proxy').Message;
var config     = require('../config');
var eventproxy = require('eventproxy');
var UserProxy  = require('../proxy').User;
var session = require('express-session');
/**
 * 需要管理员权限
 */
exports.adminRequired = function (req, res, next) {
  if (!req.session.user) {
    return res.render('notify/notify', { error: '你还没有登录。' });
  }

  if (!req.session.user.is_admin) {
    return res.render('notify/notify', { error: '需要管理员权限。' });
  }

  next();
};

/**
 * 需要登录
 */
exports.userRequired = function (req, res, next) {
	
	/*var sessionid=req.headers['sessionID'];
	req.sessionStore.get(sessionid,function(a,ses){
		if(!ses||!ses.user)
		{
			return res.status(403).send('forbidden!');
		}
		else
		{
			next();
		}
	} ); */
	console.log("userRequired")
	console.log(req.session)
  if (!req.session || !req.session.user || !req.session.user._id) {
    return res.status(403).send('forbidden!');
  }
console.log("userRequired")
  next();
};

exports.blockUser = function () {
  return function (req, res, next) {
    if (req.path === '/signout') {
      return next();
    }
 
    if (req.session.user && req.session.user.is_block && req.method !== 'GET') {
		 
      return res.status(403).send('您已被管理员屏蔽了。有疑问请联系 @alsotang。');
    }
	 
    next();
  };
};


function gen_session(user, res) {
  var auth_token = user._id + '$$$$'; // 以后可能会存储更多信息，用 $$$$ 来分隔
  var opts = {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30,
    signed: true,
    httpOnly: true
  };
  res.cookie(config.auth_cookie_name, auth_token, opts); //cookie 有效期30天
}

exports.gen_session = gen_session;

exports.saveSession= function (user, req,res) 
{
	
	user = res.locals.current_user = req.session.user = new UserModel(user);
 
 
    if (config.admins.hasOwnProperty(user.loginname)) {
      user.is_admin = true;
    }
 
}

// 验证用户是否登录
exports.authUser = function (req, res, next) {
  var ep = new eventproxy();
  ep.fail(next);

 
  // Ensure current_user always has defined.
  res.locals.current_user = null;

  if (config.debug && req.cookies['mock_user']) {
    var mockUser = JSON.parse(req.cookies['mock_user']);
    req.session.user = new UserModel(mockUser);
    if (mockUser.is_admin) {
      req.session.user.is_admin = true;
    }
    return next();
  } 
  /*ep.all('get_user', function (user) {
    if (!user) {
      return next();
    }
    user = res.locals.current_user = req.session.user = new UserModel(user);

    if (config.admins.hasOwnProperty(user.loginname)) {
      user.is_admin = true;
    }

    Message.getMessagesCount(user._id, ep.done(function (count) {
      user.messages_count = count;
      next();
    }));
  });
  */
  ep.all('get_user', function (ses) {
	   
    if(!ses)
	{
		
		return next();
	}
    user = res.locals.current_user = req.session.user = ses.user;
 
    if (config.admins.hasOwnProperty(user.loginname)) {
      user.is_admin = true;
    }
 
    Message.getMessagesCount(user._id, ep.done(function (count) {
		 
		 
      user.messages_count = count;
      next();
    }));
  });
  
 
  if (req.session.user) {
 console.log(145)
 console.log(req.session.user)
    ep.emit('get_user', req.session);
  } else {
 
    var auth_token = req.signedCookies[config.auth_cookie_name];
	var sessionid=req.headers['sessionid'];
	
	 
	req.sessionStore.get(sessionid,ep.done('get_user') ); 
    
	/*if (!auth_token) {
      return next();
    }

    var auth = auth_token.split('$$$$');
    var user_id = auth[0];
    UserProxy.getUserById(user_id, ep.done('get_user'));
	*/
  }
};
