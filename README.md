# Exercise (Instructions): HTTPS and Secure Communication

## Objectives and Outcomes

In this exercise you will explore the use of the HTTPS server core node module to create and run a secure server. You will also learn about generating your private key and public certificate and use them to configure your Node HTTPS server. At the end of this exercise, you will be able to:

- Configure a secure server in Node using the core HTTPS module
- Generate the private key and public certificate and configure the HTTPS server
- Redirect traffic from the insecure HTTP server to a secure HTTPS server.

### Updating the bin/www File

Open the www file in the bin directory and update its contents as follows:
```
#!/usr/bin/env node
/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('rest-server:server');
var http = require('http');
var https = require('https');
var fs = require('fs');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');

app.set('port', port);
app.set('secPort',port+443);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, function() {
   console.log('Server listening on port ',port);
});
server.on('error', onError);
server.on('listening', onListening);

/**
 * Create HTTPS server.
 */ var options = {
  key: fs.readFileSync(__dirname+'/private.key'),
  cert: fs.readFileSync(__dirname+'/certificate.pem')
};

var secureServer = https.createServer(options,app);

/**
 * Listen on provided port, on all network interfaces.
 */

secureServer.listen(app.get('secPort'), function() {
   console.log('Server listening on port ',app.get('secPort'));
});
secureServer.on('error', onError);
secureServer.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;

    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;

    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
```

### Updating app.js

Open `app.js` and add the following code to the file:

```
// Secure traffic only
app.all('*', function(req, res, next){
    console.log('req start: ',req.secure, req.hostname, req.url, app.get('port'));
  if (req.secure) {
    return next();
  };

 res.redirect('https://'+req.hostname+':'+app.get('secPort')+req.url);
});
```

### Generating Private Key and Certificate

Go to the bin folder and then create the private key and certificate by typing the following at the prompt:
```
openssl genrsa 1024 > private.key
openssl req -new -key private.key -out cert.csr
openssl x509 -req -in cert.csr -signkey private.key -out certificate.pem
```

### Note for Windows Users

> If you are using a Windows machine, you may need to install openssl. You can find some openssl binary distributions here. Also, this article gives the steps for generating the certificates in Windows. Another article provides similar instructions. Here's an online service to generate self-signed certificates.
Run the server and test.
Conclusions

In this exercise, you learnt about configuring a secure server running HTTPS protocol in our Express application.

# Exercise (Instructions): Using OAuth with Passport and Facebook

## Objectives and Outcomes

In this exercise you will make use of Passport OAuth support through the passport-facebook module together with Facebook's OAuth support to enable user authentication within your server. At the end of this exercise, you will be able to:

Configure your server to support user authentication based on OAuth providers
Use Passport OAuth support through the passport-facebook module to support OAuth based authentication with Facebook for your users.
Installing passport-facebook Module

In the rest-server-passport folder, install passport-facebook module by typing the following at the prompt:
     `npm install passport-facebook --save`

### Refactoring Authentication Code

Create a new file named authenticate.js and add the following code to it:
```
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
```

### Updating app.js

Update app.js to include authenticate.js module:
`var authenticate = require('./authenticate');`
`
Note do not remove
`app.use(passport.initialize());`

Remove the following line:
`var LocalStrategy = require('passport-local').Strategy;`

Also, remove the following lines from the passport configuration part of app.js:
```
var User = require('./models/user');passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
```
### Updating config.js

Update config.js as follows:
```
module.exports = {
    'secretKey': '12345-67890-09876-54321',
    'mongoUrl' : 'mongodb://localhost:27017/conFusion',
    'facebook': {
        clientID: 'YOUR FACEBOOK APP ID',
        clientSecret: 'YOUR FACEBOOK SECRET',
        callbackURL: 'https://localhost:3443/users/facebook/callback'
    }
}
```

### Updating User Model

Open `user.js` from the models folder and update the User schema as follows:
```
var User = new Schema({
    username: String,
    password: String,
    OauthId: String,
    OauthToken: String,
    firstname: {
      type: String,
      default: ''
    },
    lastname: {
      type: String,
      default: ''
    },
    admin:   {
        type: Boolean,
        default: false
    }
});
```

### Setting up Facebook Authentication

Open authenticate.js and add in the following line to add Facebook strategy:
```
var FacebookStrategy = require('passport-facebook').Strategy;
```

Then add the following code to initialize and set up Facebook authentication strategy in Passport:
```
exports.facebook = passport.use(new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret,
  callbackURL: config.facebook.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ OauthId: profile.id }, function(err, user) {
      if(err) {
        console.log(err); // handle errors!
      }
      if (!err && user !== null) {
        done(null, user);
      } else {
        user = new User({
          username: profile.displayName
        });
        user.OauthId = profile.id;
        user.OauthToken = accessToken;
        user.save(function(err) {
          if(err) {
            console.log(err); // handle errors!
          } else {
            console.log("saving user ...");
            done(null, user);
          }
        });
      }
    });
  }
));
```

### Updating users.js

Open users.js and add the following code to it:
```
router.get('/facebook', passport.authenticate('facebook'),
  function(req, res){});

router.get('/facebook/callback', function(req,res,next){
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
              var token = Verify.getToken(user);
              res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});
```

### Registering your app on Facebook

Go to `https://developers.facebook.com/apps/` and register your app by following the instructions there and obtain your App ID and App Secret, and then update config.js with the information.
Start your server and test your application. You can log in using Facebook by accessing `https://localhost:3443/users/facebook` which will redirect you to Facebook for authentication and return to your server.

## Conclusions

In this exercise you learnt about using the Facebook OAuth support to enable authentication of your users and allowing them access to your server.
