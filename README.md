# gmail-xoauth

This module generates xoauth string from oauth 1.0 token for Gmail IMAP login. The logic is taken from http://code.google.com/p/google-mail-xoauth-tools/source/browse/trunk/python/xoauth.py.

# Installation

    $ npm install gmail-xoauth

# Example
````Javascript
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
````
# Example of 2-legged Auth

This scenario covers the case of a pre-existing key/secret that allows access to an entire Gmail domain. 
E.g. when a domain admin has given access to a 3rd party. That 3rd party will have a key/secret pair and 
can request auth using it as follows. This is called "two legged auth" in some documentation. 
Note the 4th argment to `generateIMAPXOauthString`. This is the `xoauth_requestor_id`. This is typically 
set to the same as the email address. Not sure why its required, but Gmail won't accept 2-legged auth 
without it. The individual's oauth token and secret are not required, so they are set to "".

````Javascript
    var imap = require('../node-imap/lib/imap'),
        XOauth = require('gmail-xoauth');

    // these are VERY secret keys. Set them in your environment to avoid checking them in
    //    export consumerKey="some_string"; export consumerSecret="some_string"
    
    var xoauth = new XOauth(process.env.consumerKey, process.env.consumerSecret);

    var ImapConnection = imap.ImapConnection;

    var imap = new ImapConnection({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        xoauth: xoauth.generateIMAPXOauthString("test@example.com", "", "", "test@example.com")
    }
  });

````
