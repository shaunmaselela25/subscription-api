import user from '../models/user.models.js';


export const getUsers = async (req, res, next) => {
    try {
        const users = await user.find();
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (error) {
        next(error);
    }   
};

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const foundUser = await user.findById(id);
        if (!foundUser) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: foundUser
        });
    }
    catch (error) {        next(error);
    }};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedUser = await user.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedUser) {
            const error = new Error('User not found');  
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }};

export const createUser = async (req, res, next) => {
    try {
        const newUser = new user(req.body);
        const savedUser = await newUser.save();
        res.status(201).json({
            success: true,  
            message: 'User created successfully',
            data: savedUser
        });
    } catch (error) {
        next(error);
    }};

export const deleteUser = async (req, res, next) => {   
    try {
        const { id } = req.params;
        const deletedUser = await user.findByIdAndDelete(id);   
        if (!deletedUser) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }   
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: deletedUser
        });
    } catch (error) {
        next(error);
    };};

    