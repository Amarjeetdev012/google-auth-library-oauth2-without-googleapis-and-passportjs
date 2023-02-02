import express from 'express';
import { deleteFile, listFile, success, uploadFile } from '../controller/user.controllers.js';
import { peopleData, redirectUrl } from '../helpers/google.helpers.js';
import { upload } from '../helpers/multer.helpers.js';

const router = express.Router();

router.get('/auth/google/', redirectUrl);

router.get('/auth/google/callback', peopleData);

router.get('/auth/google/success', success);
router.post('/auth/google/upload', upload, uploadFile);
router.get('/auth/google/list', listFile);
router.post('/auth/google/delete/:id',deleteFile)

export default router;
