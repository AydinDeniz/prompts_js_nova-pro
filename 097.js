// Custom implementation of a Single Sign-On (SSO) service

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const OIDCStrategy = require('passport-openidconnect').Strategy;

const app = express();

// Configure session management
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

// Configure Passport for SAML and OIDC strategies
passport.use(new SamlStrategy({
    entryPoint: 'https://idp.example.com/sso',
    issuer: 'https://sp.example.com',
    callbackUrl: 'https://sp.example.com/auth/saml/callback'
}, (profile, done) => {
    return done(null, profile);
}));

passport.use(new OIDCStrategy({
    issuer: 'https://idp.example.com',
    authorizationURL: 'https://idp.example.com/authorize',
    tokenURL: 'https://idp.example.com/token',
    clientID: 'client_id',
    clientSecret: 'client_secret',
    callbackURL: 'https://sp.example.com/auth/oidc/callback'
}, (issuer, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Routes for SAML and OIDC authentication
app.get('/auth/saml', passport.authenticate('saml'));
app.post('/auth/saml/callback', passport.authenticate('saml', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

app.get('/auth/oidc', passport.authenticate('oidc'));
app.get('/auth/oidc/callback', passport.authenticate('oidc', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

// Just-in-time provisioning and attribute mapping
function provisionUser(profile) {
    // Implement user provisioning logic here
    return { id: profile.id, email: profile.emails[0].value, name: profile.displayName };
}

// Middleware to handle secure session propagation across domains
function propagateSession(req, res, next) {
    const sessionId = req.sessionID;
    res.cookie('sessionId', sessionId, { domain: '.example.com', secure: true, httpOnly: true });
    next();
}

app.use(propagateSession);

app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        const user = provisionUser(req.user);
        res.json({ message: 'Authenticated', user });
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.send('<a href="/auth/saml">Login with SAML</a><br><a href="/auth/oidc">Login with OIDC</a>');
});

app.listen(3000, () => {
    console.log('SSO service running on port 3000');
});