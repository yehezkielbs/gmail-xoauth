var crypto = require('crypto');
var _ = require('underscore');

var XOauth = function (consumer_key, consumer_secret) {
  this.consumer = {
    key: consumer_key || 'anonymous',
    secret: consumer_secret || 'anonymous'
  };
};

/////////////// PUBLIC /////////////

XOauth.prototype.escapeAndJoin = function (elems) {
  return elems.map(function (x) {
    return encodeURIComponent(x);
  }).join('&');
};

XOauth.prototype.formatUrlParams = function (params) {
  var param_fragments = [];

  _.each(_.sortBy(_.keys(params), function (key) {return key}), function (key) {
    param_fragments.push(key + '=' + encodeURIComponent(params[key]));
  });

  return param_fragments.join('&');
};

XOauth.prototype.generateSignatureBaseString = function (method, request_url_base, params) {
  return this.escapeAndJoin([method, request_url_base, this.formatUrlParams(params)]);
};

XOauth.prototype.generateHmacSha1Signature = function (text, key) {
  return crypto.createHmac('sha1', key).update(text).digest('base64');
};

XOauth.prototype.generateOauthSignature = function (base_string, token_secret) {
  var key = this.escapeAndJoin([this.consumer.secret, token_secret]);
  return this.generateHmacSha1Signature(base_string, key);
};

XOauth.prototype.generateCommonOauthParams = function (nonce, timestamp) {
  var params = {};

  params['oauth_consumer_key'] = this.consumer.key
  if (nonce) {
    params['oauth_nonce'] = nonce;
  }
  else {
    params['oauth_nonce'] = '' + Math.floor(Math.random() * (Math.pow(2, 64) - 1));
  }
  params['oauth_signature_method'] = 'HMAC-SHA1';
  params['oauth_version'] = '1.0';
  if (timestamp) {
    params['oauth_timestamp'] = timestamp;
  }
  else {
    params['oauth_timestamp'] = Math.floor((new Date().getTime()) / 1000);
  }

  return params;
};

XOauth.prototype.generateXOauthString = function (access_token, user, proto, xoauth_requestor_id, nonce, timestamp) {
  var method = 'GET',
    url_params = {},
    oauth_params = {},
    signed_params,
    request_url_base,
    base_string,
    signature,
    formatted_params = [],
    param_list,
    request_url,
    preencoded;

  if (xoauth_requestor_id) {
    url_params['xoauth_requestor_id'] = xoauth_requestor_id;
  }

  oauth_params = this.generateCommonOauthParams(nonce, timestamp);
  if (access_token.key) {
    oauth_params['oauth_token'] = access_token.key;
  }

  signed_params = _.extend(oauth_params, url_params);
  request_url_base = 'https://mail.google.com/mail/b/' + user + '/' + proto + '/';
  base_string = this.generateSignatureBaseString(method, request_url_base, signed_params);

  signature = this.generateOauthSignature(base_string, access_token.secret);
  oauth_params['oauth_signature'] = signature;
  _.each(_.sortBy(_.keys(oauth_params), function (k) {return k}), function (k) {
    var v = oauth_params[k];
    formatted_params.push(k + '="' + encodeURIComponent(v) + '"');
  });

  param_list = formatted_params.join(',');
  if (url_params.length > 0) {
    request_url = request_url_base + '?' + this.formatUrlParams(url_params);
  }
  else {
    request_url = request_url_base;
  }

  preencoded = [method, request_url, param_list].join(' ');

  return preencoded;
};

XOauth.prototype.generateIMAPXOauthString = function (user, oauth_token, oauth_token_secret, xoauth_requestor_id, nonce, timestamp) {
  var access_token = {
      key: oauth_token,
      secret: oauth_token_secret
    },
    xoauth_string, encoded_xoauth_string;

  xoauth_string = this.generateXOauthString(access_token, user, 'imap', xoauth_requestor_id, nonce, timestamp);
  encoded_xoauth_string = (new Buffer(xoauth_string)).toString('base64');

  return encoded_xoauth_string;
};

module.exports = XOauth;
