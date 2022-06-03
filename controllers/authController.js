const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });

  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
      job: req.body.job,
      role: req.body.role,
      password: req.body.password,
    });
    createSendToken(newUser, 201, req, res);
  } catch (error) {
    throw new Error("can't signup from [ signup ]", error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new Error("Please provide email and password!"));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.checkPassword(password, user.password))) {
      return next(new Error("Incorrect email or password"));
    }
    createSendToken(user, 200, req, res);
  } catch (error) {
    throw new Error(`can't login from [ login controller ]`, error);
  }
};

exports.logout = (req, res) => {
  try {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 100),
      httpOnly: true,
    });
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(402).json({ status: "failed" });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next(
        new Error("You are not logged in! Please log in to get access.")
      );
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new Error("The user does not exist."));
    }
    req.user = currentUser;
    next();
  } catch (error) {
    console.log("protect controller error", error);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Error("You do not have permission to perform this action")
      );
    }
    console.log("admin has rights");
    next();
  };
};
