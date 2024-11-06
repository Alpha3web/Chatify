require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const MessageController = require("../controllers/messageController");
const UserController = require("../controllers/userController");
const GroupController = require("../controllers/groupController");
const { authenticate } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const uuid = require('uuid');


// Set storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../chat_frontend/public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });


// User routes

router.post("/register", async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 10),
    });
    const savedUser = await user.save();
    const token = jwt.sign({
      userId: savedUser._id,
      jti: uuid.v4(), // Unique identifier
    }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      secure: true,
      maxAge: 60 * 60 * 1000,
    });
    res.redirect("/");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send("Invalid credentials");
      }
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      res.cookie("token", token, {
        secure: true,
        maxAge: 60 * 60 * 1000,
      });
      res.redirect("/")// Notify client of successful login
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).send('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(422).send('Invalid token');
      } else {
        return res.status(500).send('Internal Server Error');
      }
    }
});

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.res.sendStatus(200); 
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
});


router.post("/create-group", authenticate, upload.single('avatar'), GroupController.createGroup);

router.get("/chats", authenticate, MessageController.getChats);
router.get("/messages/:receiverId", authenticate, MessageController.getMessagesHistory);
router.get("/:groupId/messages", authenticate, MessageController.groupMessages);
router.get("/users/:id", authenticate, UserController.getUser);
router.get("/groups/:groupId", authenticate, GroupController.getGroup);
router.get("/users", authenticate, UserController.getAllUsers);
router.get("/groups", authenticate, GroupController.getGroups);
router.delete("/delete/:messageId", authenticate, MessageController.deleteMessage);
router.post("/send-message", authenticate, upload.single('file'), MessageController.sendMessage);

module.exports = router;