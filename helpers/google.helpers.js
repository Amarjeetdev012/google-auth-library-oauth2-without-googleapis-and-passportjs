import dotenv from 'dotenv';
dotenv.config();
import { OAuth2Client } from 'google-auth-library';
import { createUser, findUser } from '../models/user.models.js';

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URL;

const oAuth2Client = new OAuth2Client(clientID, clientSecret, redirectUri);

export const redirectUrl = async (req, res) => {
  try {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      //   prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    });
    res.redirect(authorizeUrl);
  } catch (err) {
    console.log(err);
  }
};

export const peopleData = async (req, res) => {
  const code = req.query.code;
  const data = await oAuth2Client.getToken(code);
  const tokenExpiry = data.tokens.expiry_date;
  const currentDate = Date.now(); //provide date in miliseconds
  oAuth2Client.setCredentials(data.tokens);
  const url = 'https://people.googleapis.com/v1/people/me?personFields=names';
  const people = await oAuth2Client.request({ url });
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
  const tokenInfo = await oAuth2Client.getTokenInfo(
    oAuth2Client.credentials.access_token
  );
  console.log('tokenInfo', tokenInfo);
  res.render('home', { data: people.data.names[0] });
};
