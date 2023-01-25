import express from 'express';
import dotenv from 'dotenv';
import logger from 'morgan';
import MongoStore from 'connect-mongo';
import { connectDatabase } from './database/mongodb.database.js';
import session from 'express-session';
dotenv.config();
import cookieParser from 'cookie-parser';
import router from './router/route.js';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  autoRemove: 'native',
});
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 69600 },
    store: store,
  })
);
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.use('/', router);

connectDatabase();
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
