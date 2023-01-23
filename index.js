import { OAuth2Client } from 'google-auth-library';
import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './database/mongodb.database.js';
import request from 'request';
import session from 'express-session';
import { createUser, findUser } from './models/user.models.js';
dotenv.config();

const app = express();
app.use(express.json());
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 69600 },
  })
);
app.use(express.urlencoded({ extended: true }));

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URL;

const oAuth2Client = new OAuth2Client(clientID, clientSecret, redirectUri);

const authorizeUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
});
//
app.get('/auth/google/', async (req, res) => {
  try {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    });
    res.redirect(authorizeUrl);
  } catch (e) {
    console.log(e);
  }
});

app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  const data = await oAuth2Client.getToken(code);
  const tokenExpiry = data.tokens.expiry_date;
  const currentDate = Date.now();
  console.log('============data', data.tokens);
  oAuth2Client.setCredentials(data.tokens);
  const url = 'https://people.googleapis.com/v1/people/me?personFields=names';
  const people = await oAuth2Client.request({ url });
  console.log('people.data', people.data);
  const googleId = people.data.resourceName;
  const newUser = {
    googleId: people.data.resourceName,
    displayName: people.data.names[0].displayName,
    accessToken: data.tokens.access_token,
    refreshToken: data.tokens.refresh_token,
    tokenExpiryDate: data.tokens.expiry_date,
  };
  const user = await findUser(googleId);
  if (!user) {
    await createUser(newUser);
  }
  console.log('people.data', people.data);
  const tokenInfo = await oAuth2Client.getTokenInfo(
    oAuth2Client.credentials.access_token
  );
  console.log('tokenInfo', tokenInfo);
});

connectDatabase();
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});

//
