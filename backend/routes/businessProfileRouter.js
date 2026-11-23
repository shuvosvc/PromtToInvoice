import express from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';

import { requireAuth } from '../middleware/requireAuth.js';
import { createBusinessProfile, getMyBusinessProfile, updateBusinessProfile } from '../controllers/businessProfileController.js';

const businessProfileRouter = express.Router();

businessProfileRouter.use(requireAuth);

// Determine safe upload directory (use os.tmpdir() in serverless environments like Vercel)
const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch {}
}

// multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, uploadDir);
    },
    filename:(req, file, cb)=>{
       const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
       const ext = path.extname(file.originalname);
       cb(null, `business-${unique}${ext}`);
    },
});

const upload = multer({storage});

// create
businessProfileRouter.post(
    "/",
    upload.fields([
        {name: "logoName", maxCount:1},
        {name: "stampName", maxCount:1},
        {name: "signatureNameMeta", maxCount:1},

    ]),
    createBusinessProfile
);

// to update
businessProfileRouter.put(
    "/:id",
    upload.fields([
        {name: "logoName", maxCount:1},
        {name: "stampName", maxCount:1},
        {name: "signatureNameMeta", maxCount:1},
    ]),
    updateBusinessProfile
);

businessProfileRouter.get("/me", getMyBusinessProfile);

export default businessProfileRouter;