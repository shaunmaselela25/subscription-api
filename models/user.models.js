import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    name: {
        type: String,   
        required: [true, 'Name is required'],
        trim: true
    },
    email: {    
        type: String,
        required: [true, 'Email is required'], 
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [5, 'Email must be at least 5 characters long'], 
        maxLength: [255, 'Email must be less than 255 characters long'],
        match: [/.+@.+\..+/, 'Please enter a valid email address']  
    },
    password: {
        type: String,
        required: [true, 'Password is required'], 
        minLength: [6, 'Password must be at least 6 characters long']    
    },
    subscriptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    }]  
}, { timestamps: true });

const User = mongoose.model('User', userSchema);


export default User;

// example of user document
/*
{
    "_id": "64b8c9f1e1b2c3d4e5f67890",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "hashed_password",
    "subscriptions": [],
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:00:00.000Z"
}
*/