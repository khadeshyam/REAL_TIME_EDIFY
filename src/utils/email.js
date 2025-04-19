import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {gmailContent, passwordResetContent, passwordChangeConfirmation} from './emailTemplate.js';
dotenv.config();
const secret_key = process.env.JWT_SECRET;



export const generateverificationToken = (email) => {
    return jwt.sign({ email: email }, secret_key, { expiresIn: '1h' })
}


export const sendVerificationEmail = async (recipientEmail, verificationToken, username) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            }

        })

        const emailcontent = gmailContent(verificationToken,username);

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: recipientEmail,
            subject: 'Email Verification',
            html: emailcontent
        })

        console.log("Verification email has been sent");

    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}


export const sendPasswordResetEmail = async (email, username, resetLink, expirationText) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            }
        });

        const htmlContent = passwordResetContent(resetLink, username, expirationText);

        await transporter.sendMail({
            from: `"RealTimeEdify" <${process.env.EMAIL}>`,
            to: email,
            subject: 'Password Reset Request',
            html: htmlContent
        });

    } catch (error) {
        console.error('Password reset email error:', error);
        throw new Error('Failed to send password reset email');
    }
};

export const sendPasswordChangeEmail = async (email, username) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            }
        });

        const htmlContent = passwordChangeConfirmation(username);

        await transporter.sendMail({
            from: `"RealTimeEdify Security" <${process.env.EMAIL}>`,
            to: email,
            subject: 'Password Change Confirmation',
            html: htmlContent
        });

    } catch (error) {
        console.error('Password change email error:', error);
        throw new Error('Failed to send confirmation email');
    }
};