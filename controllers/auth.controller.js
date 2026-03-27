import mongoose from 'mongoose';
import User from '../models/user.models.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from '../config/env.js';

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { name, email, password } = req.body;
        const existingUser = await  User.findOne({ email }).session(session);
        if (existingUser) {
            const error = new Error('Email already in use');
            error.statusCode = 400;
            throw error;
        }
        
        // hash the password before saving the user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const Newuser = new User({ name, email, password: hashedPassword });
        await Newuser.save({ session });

        const token = jwt.sign({ id: Newuser._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });


        await session.commitTransaction();
        session.endSession();
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                id: Newuser._id,
                name: Newuser.name,
                email: Newuser.email
            }
        });


    } 
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

export const signIn = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token,
                user,
            }
        });

    } catch (error) {
        next(error);
    }
};


export const signOut = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    res.send({ title: 'Sign out route' });
};



