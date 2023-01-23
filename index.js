import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './database/mongodb.database.js';
import session from 'express-session';
dotenv.config();
import router from './router/route.js';

const app = express();
const port = process.env.PORT || 3000;
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
app.set('view engine', 'ejs');

app.use('/', router);

connectDatabase();
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
