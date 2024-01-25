import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {User} from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(
            500,
            `Something went wrong while generation access and refresh token's`
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validate data - not empty
    // check if user exist in db - phone number
    // create user object in db - instance creation
    // send response to frontend

    const {phone_number, priority} = req.body;

    if (!phone_number) {
        throw new ApiError(400, 'Phone number is required');
    }

    const existedUser = await User.exists({phone_number});

    if (existedUser) {
        throw new ApiError(
            409,
            'User with given phone number already exists in database'
        );
    }

    const user = await User.create({
        phone_number,
        priority,
    });

    if (!user) {
        throw new ApiError(500, 'Error while creating user');
    }

    return res
        .status(201)
        .json(new ApiResponse(201, user, 'User created successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
    // Take valid phone number from frontend
    // valid user in database - phone number
    // Generate refresh token
    // store in db and return to user
    // also handle error in each step

    const {phone_number} = req.body;

    if (!phone_number) {
        throw new ApiError(400, 'Phone number is required');
    }

    const user = await User.findOne({
        phone_number,
    });

    if (!user) {
        throw new ApiError(404, "User doesn't exists with given phone number");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select('-refreshToken');

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    refreshToken,
                    accessToken,
                },
                'User loggedIn successfully'
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        },
        new: true,
    });

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User loggedout succesfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request');
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token is expired or Used');
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(
            user._id
        );

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken,
                    },
                    'Token refreshed successfully'
                )
            );
    } catch (error) {
        throw new ApiError(400, error?.message || 'Invalid refresh token');
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, 'User fetched successfully'));
});

// const updateUserPhoneNumber = asyncHandler(async (req, res) => {
//     const {phone_number} = req.body;

//     if (!phone_number) {
//         throw new ApiError(400, 'Phone number is required');
//     }

//     const existedUser = await User.exists({phone_number});

//     if (existedUser) {
//         throw new ApiError(
//             409,
//             'User with given phone number already exists in database'
//         );
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 phone_number,
//             },
//         },
//         {new: true}
//     );

//     return res
//         .status(200)
//         .json(new ApiResponse(200, user, 'User phone number updated'));
// });

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    // updateUserPhoneNumber,
};
