import dotenv from 'dotenv';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { findUser } from '../models/user.models.js';
import fs from 'fs';
import { unlink } from 'node:fs';
import { createDocument, listDocument } from '../models/document.models.js';
dotenv.config();

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URL;
const GOOGLE_API_FOLDER_ID = process.env.GOOGLE_FOLDER_ID;

const oAuth2Client = new OAuth2Client(clientID, clientSecret, redirectUri);

export const success = async (req, res) => {
  res.render('home');
};

export const uploadFile = async (req, res) => {
  const tokenData = req.cookies;
  let file = req.file;
  const OAuth2Client = new google.auth.OAuth2();
  OAuth2Client.setCredentials({
    access_token: tokenData['token data'].access_token,
  });
  const id = req.cookies.googleId;
  const user = await findUser(id);
  const path = file.path;
  const drive = google.drive({
    version: 'v3',
    auth: OAuth2Client,
  });
  const fileMetadata = {
    name: file.originalname,
    parents: [GOOGLE_API_FOLDER_ID],
  };
  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(path),
  };
  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id,name',
  });
  const responseId = response.data.id;
  const data = {};
  data.imageId = responseId;
  data.folderId = GOOGLE_API_FOLDER_ID;
  data.googleId = id;
  data.filename = req.file.filename;
  data.mimetype = req.file.mimetype;
  data.originalname = req.file.originalname;
  await createDocument(data);

  unlink(path, (err) => {
    if (err) throw err;
    console.log(`${path} file deleted`);
  });
  res.render('uploadResponse', { data: file.originalname });
};

export const listFile = async (req, res) => {
  const id = req.cookies.googleId;
  let user = await findUser(id);
  const googleId = user.googleId;
  const list = await listDocument(googleId, GOOGLE_API_FOLDER_ID);
  res.render('listResponse', {
    data: list,
  });
};
