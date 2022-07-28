const express = require("express");
const session = require("express-session");
const passport = require("passport");
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;
const CALLBACK_URL = "/ibm/cloud/appid/callback";
const appidConfig = require("./config/mappings.json");

const path = require("path");

const app = express();

app.use(
  session({
    secret: appidConfig.secret,
    resave: true,
    saveUninitialized: true,
  })
);

const appidcfg = JSON.parse(appidConfig.APPID_CONFIG);
passport.use(
  new WebAppStrategy({
    tenantId: appidcfg.tenantId,
    clientId: appidConfig.client_id,
    secret: appidConfig.secret,
    oauthServerUrl: appidcfg.oauthServerUrl,
    redirectUri: appidConfig.application_url + CALLBACK_URL,
  })
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "../build")));

app.get("/health", function (req, res) {
  res.json({ status: "UP" });
});

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

const port = process.env.PORT ?? 3000;
app.listen(port, function () {
  console.info(`Server listening on http://localhost:${port}`);
});
