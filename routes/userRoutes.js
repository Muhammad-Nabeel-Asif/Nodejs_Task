const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);
router.get("/myProfile", userController.getMyProfile, userController.getUser);

// Admin Restricted route
router.get(
  "/allUsers",
  authController.restrictTo("admin"),
  userController.getAllUsers
);

module.exports = router;
