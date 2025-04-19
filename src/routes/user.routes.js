import express from 'express';
import { register, login, verifyemail, me,forgotPassword, resetPassword} from '../controllers/auth.controller.js';
import validateToken from '../middlewares/auth.middleware.js';

const userRouter = express.Router();


userRouter.route('/register').post(register);
userRouter.route('/verifyemail/:tokenId').get(verifyemail);
userRouter.route('/login').post(login);
userRouter.route('/me').get(validateToken, me)
userRouter.post('/forgot-password', forgotPassword);
userRouter.put('/reset-password/:token', resetPassword);


export default userRouter;