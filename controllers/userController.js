const User = require("./../models/userModel");

exports.getMyProfile = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = async (req, res, next) => {
  try {
    let doc = await User.findById(req.params.id);
    if (!doc) {
      return next(new Error("No document found with that ID"));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (error) {
    throw new Error("Can't get user from [ getUser ] ", error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find({});
    console.log("all users = ", allUsers);
    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: allUsers.length,
      data: {
        data: allUsers,
      },
    });
  } catch (error) {
    throw new Error("Can't get all users from [ getAllUsers ] ", error);
  }
};
