import {Schema, model} from 'mongoose';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        phone_number: {
            type: String,
            required: true,
            unique: true,
        },
        priority: {
            type: Number,
            default: 0,
            enum: [0, 1, 2],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            priority: this.priority,
            phone_number: this.phone_number,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = model('User', userSchema);
