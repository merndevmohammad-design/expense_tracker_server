const User = require("../models/user-model");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/sendJSONResponse");
const jwt = require('jsonwebtoken');


const register = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, phone, password} = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return sendErrorResponse(res, 400, "Email already exists");
    }

    const usernameExist = await User.findOne({ username });
    if (usernameExist) {
      return sendErrorResponse(res, 400, "Username already exists");
    }

    const newUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
     
    });

    const token = newUser.generateToken();

    return sendSuccessResponse(res, 201, {
      message: "Account created successfully",
      doc: {
        id: newUser._id.toString(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        token: token,
        createdAt: newUser.createdAt,
      },
    });

  } catch (error) {
    next(error);
  }
};



const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier) {
      return sendErrorResponse(res, 400, "Please provide email, username, or phone");
    }

    if (!password) {
      return sendErrorResponse(res, 400, "Please provide password");
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier },
      ],
    });

    // 3. Check user + password
    if (!user || !(await user.comparePassword(password))) {
      return sendErrorResponse(res, 401, "Invalid credentials");
    }

    const token = user.generateToken();

    // 5. Response
    return sendSuccessResponse(res, 200, {
      message: "Login successful",
      doc: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        token,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    next(error);
  }
};


const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendErrorResponse(res, 401, "Authorization required. Please login first.");
    }

    const token = authHeader.split(" ")[1];

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return sendErrorResponse(res, 401, "Invalid or expired token. Please login again.");
    }

    return sendSuccessResponse(res, 200, {
      message: "Logged out successfully",
    });

  } catch (error) {
    next(error);
  }
};



const updateMyProfile = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return sendErrorResponse(res, 401, "Invalid or expired token");
    }

    const userId = decoded.userId;

    const user = await User.findById(userId);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    const { firstName, lastName, username, email, phone } = req.body;

    // check email duplicate
    if (email && email !== user.email) {
      const emailExist = await User.findOne({ email });
      if (emailExist) {
        return sendErrorResponse(res, 400, "Email already exists");
      }
      user.email = email;
    }

    if (username && username !== user.username) {
      const usernameExist = await User.findOne({ username });
      if (usernameExist) {
        return sendErrorResponse(res, 400, "Username already exists");
      }
      user.username = username;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    const updatedProfile = await user.save();

    return sendSuccessResponse(res, 200, {
      message: "Profile updated successfully",
      doc: {
        id: updatedProfile._id.toString(),
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        username: updatedProfile.username,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};



const updateMyPassword = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendErrorResponse(res, 401, "Authorization required");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return sendErrorResponse(res, 401, "Invalid or expired token");
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;


    if (!oldPassword || !newPassword || !confirmPassword) {
      return sendErrorResponse(res, 400, "All fields are required");
    }

    
    if (newPassword !== confirmPassword) {
      return sendErrorResponse(res, 400, "Passwords do not match");
    }

  
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return sendErrorResponse(res, 401, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return sendSuccessResponse(res, 200, {
      message: "Password changed successfully. Please login again.",
    });

  } catch (error) {
    next(error);
  }
};


module.exports = { register,login,logout ,updateMyProfile,updateMyPassword};