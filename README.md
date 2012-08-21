# gmail-xoauth

This module generates xoauth string from oauth 1.0 token for Gmail IMAP login. The logic is taken from http://code.google.com/p/google-mail-xoauth-tools/source/browse/trunk/python/xoauth.py.

# Installation

    $ npm install gmail-xoauth

# Example

    var ImapConnection = require('imap').ImapConnection,
        XOauth = require('gmail-xoauth');

    xoauth = new XOauth(<consumer key>, <consumer secret>);

    var imapConfig = {
      username: <email address>,
      xoauth: xoauth.generateIMAPXOauthString(<email address>, <oauth token>, <oauth token secret>),
      host: 'imap.gmail.com',
      port: '993',
      secure: true
    }

    var imap = new ImapConnection(this.imapConfig);
