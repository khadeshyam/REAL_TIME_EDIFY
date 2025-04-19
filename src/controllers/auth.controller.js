import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {sendVerificationEmail, generateverificationToken, sendPasswordResetEmail, sendPasswordChangeEmail} from "../utils/email.js"
import {successFullVerification} from "../utils/emailTemplate.js"

// Add expiration time formatter
const formatExpiration = (expiresIn) => {
    const units = {
        d: 'day',
        h: 'hour',
        m: 'minute'
    };
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn);
    return `${value} ${units[unit]}${value > 1 ? 's' : ''}`;
};

export const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const register = async (req, res) => {

    try{
        const {username, email, password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message: `User with email ${email} already exists`});
        const doesUsernameExists = await User.findOne({username});
        if(doesUsernameExists) return res.status(400).json({message: `Username ${username} already exists`});
        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationToken = generateverificationToken(email);
        await sendVerificationEmail(email.toLowerCase(), verificationToken, username);
        const result = await User.create({email, password: hashedPassword, username, verificationToken});
        res.status(201).json({user: result, message: `Verification email has been sent to ${email}`});
    }catch(error){
        res.status(500).json({message: error.message});
    }

}


export const verifyemail = async (req, res) => {
    try {
        const tokenId = req.params.tokenId;
        const user = await User.findOne({ verificationToken: tokenId });

        if (!user) {
            return res.status(404).json({ error: 'Invalid verification token.' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        const congratulationContent = successFullVerification(user.username);

        res.send(congratulationContent);

    } catch (error) {
        res.status(500).json({ error: 'An error occurred during email verification.' });
        console.log(error);
    }
};

export const login = async (req, res) => {

    try{
        const {email, password} = req.body;
        const existingUser = await User.findOne({email});
        if(!existingUser) return res.status(404).json({message: "User doesn't exist"});
        if(!existingUser.isVerified) return res.status(400).json({message: `Please verify your ${email} first`});
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials"});
        const token = jwt.sign({email: existingUser.email, id: existingUser._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        res.status(200).json({user: existingUser, token: token, message: "Logged in successfully"});
    }catch(error){
        res.status(500).json({message: error.message});
    }

}

export const getUsers = async (req, res) => {
    try{
        const users = await User.find();
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message: error.message});
    }
}


export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Generate reset token
        const resetToken = generateverificationToken(email);
        
        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiry = Date.now() + 3600000;
        await user.save();
        console.log(user)

        const expiresIn = process.env.JWT_RESET_EXPIRES_IN || '1h';
        const expirationText = formatExpiration(expiresIn);
        
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        await sendPasswordResetEmail(
            user.email,
            user.username,
            resetLink,
            expirationText
        );

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing password reset request'
        });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    console.log(`Token :${token}`)
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`decoded.email :${decoded.email}`)

        
        const user = await User.findOne({
            email: decoded.email,
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gte: Date.now() }
        });


        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiry = null;
        await user.save();

        // Send confirmation email
        await sendPasswordChangeEmail(user.email, user.username);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully. Confirmation email sent.'
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Reset token has expired'
            });
        }
        console.error('Reset password error:', error);
        res.status(400).json({
            success: false,
            message: 'Invalid reset token'
        });
    }
};