import express from 'express';
import { peopleData, redirectUrl } from '../helpers/google.helpers.js';

const router = express.Router();

router.get('/auth/google/', redirectUrl);

router.get('/auth/google/callback', peopleData);

export default router;
