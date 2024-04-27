const ErrorHander = require("../utils/Errorhandler");
const User = require("../models/Usermodel");
const sendToken = require("../utils/sendToken")


exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "Please Enter Name, Email, and Password"
            });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                error: "Email already exists"
            });
        }

        // Attempt to create the user
        user = await User.create({
            name,
            email,
            password,
        });

        // Check if the user was successfully created
        if (!user) {
            return res.status(500).json({
                success: false,
                error: "Failed to create user"
            });
        }

        // If the user was successfully created, send token
        sendToken(user, 201, res);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

//Login
exports.LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                msg: "Please Filled All Required Filled"
            })
        }
        //after this check user
        const existUser = await User.findOne({ email })
        if (!existUser) {
            return res.status(401).json({
                success: false,
                msg: "user is not find"
            })
        }
        //if user found
        const checkPassword = await existUser.comparePassword(password)
        if (!checkPassword) {
            return res.status(401).json({
                success: false,
                msg: "Password is Invalid"
            })
        }

        sendToken(existUser, 201, res)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

//Logout
exports.Logout = async (req, res) => {
    try {
        // Clear the JWT token cookie
        res.clearCookie('token');

        // Send a success response
        return res.status(200).json({
            success: true,
            msg: "Logout successful"
        });
    } catch (error) {
        // Handle errors
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
};


//get-All-users
exports.getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find({}, { password: 0 });
        if (!allUsers.length > 0) {
            return res.status(403).json({
                success: false,
                msg: "Not available"
            });
        }
        res.status(200).json({
            success: true,
            users: allUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
}

//Password Change

//get token from cookies
exports.getTokenFromCookies = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({
                success: true,
                msg: "Please Login To Access this"
            });
        }
         res.status(200).json({
            success: true,
            data: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
}
