import {Router} from 'express';
const router = Router();

import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    getCurrentUser,
} from '../controllers/user.controller.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
// Secret routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(verifyJWT,refreshAccessToken);
router.route('/current-user').get(verifyJWT, getCurrentUser);

export default router;
