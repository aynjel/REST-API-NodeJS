import bcrypt from "bcryptjs";
import gravatar from "gravatar";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Jimp from "jimp";
import path from "path";
import fs from "fs/promises";
import { User } from "../models/usersModel.js";
// prettier-ignore
import { emailValidation, signupValidation, subscriptionValidation } from "../validations/validation.js";
import { httpError } from "../helpers/httpError.js";
import { v4 as uuid4 } from "uuid";
import { sendEmail } from "../helpers/sendEmail.js";

const { SECRET_KEY, PORT } = process.env;

const signupUser = async (req, res) => {
  const { email, password } = req.body;

  //  Registration validation error
  const { error } = signupValidation.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
  }

  // Registration conflict error
  const user = await User.findOne({ email });
  if (user) {
    throw httpError(409, "Email in Use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  // Create a link to the user's avatar with gravatar
  const avatarURL = gravatar.url(email, { protocol: "http" });

  // Create a verificationToken for the user
  const verificationToken = uuid4();

  // Create a verificationTokenWithExpiry for the user for 1 minute
  const verificationTokenWithExpiry = `${verificationToken}T${
    new Date().getTime() + 1000 * 60 * 60
  }`;

  const newUser = await User.create({
    email,
    password: hashPassword,
    avatarURL,
    verificationToken: verificationTokenWithExpiry,
  });

  // Send an email to the user's mail and specify a link to verify the email (/users/verify/:verificationToken) in the message
  await sendEmail({
    to: email,
    subject: "Action Required: Verify Your Email",
    html: `
      <h1>Welcome to our service</h1>
      <p>
        To complete the registration process and have access to all the features of our service, please click the link below to verify your email address:
      </p>
      <p>
       The link will be active for 1 hour.
      </p>
      <a style="display: block; padding: 10px; background-color: #4CAF50; color: white; text-align: center; text-decoration: none;" href="http://localhost:${PORT}/api/users/verify/${verificationTokenWithExpiry}">Verify Email</a>
    `,
  });

  // Registration success response
  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
      verificationToken: newUser.verificationToken,
    },
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  //  Login validation error
  const { error } = signupValidation.validate(req.body);
  if (error) {
    throw httpError(401, error.message);
  }

  // Login auth error (email)
  const user = await User.findOne({ email });
  if (!user) {
    throw httpError(401, "Email or password is wrong");
  }

  // Login auth error (password)
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw httpError(401, "Email or password is wrong");
  }

  const payload = { id: user._id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

  await User.findByIdAndUpdate(user._id, { token });

  //   Login success response
  res.status(200).json({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logoutUser = async (req, res) => {
  const { _id } = req.user;

  // Logout unauthorized error (setting token to empty string will remove token -> will logout)
  await User.findByIdAndUpdate(_id, { token: "" });

  //   Logout success response
  res.status(204).send();
};

const getCurrentUsers = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const updateUserSubscription = async (req, res) => {
  const { error } = subscriptionValidation.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
  }

  const { _id } = req.user;

  const updatedUser = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  });

  res.json({
    email: updatedUser.email,
    subscription: updatedUser.subscription,
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: oldPath, originalname } = req.file;

  await Jimp.read(oldPath).then((image) =>
    // image.resize(250, 250).write(oldPath)
    image.cover(250, 250).write(oldPath)
  );

  const extension = path.extname(originalname);

  const filename = `${_id}${extension}`;
  const newPath = path.join("public", "avatars", filename);
  await fs.rename(oldPath, newPath);

  let avatarURL = path.join("/avatars", filename);
  avatarURL = avatarURL.replace(/\\/g, "/");

  await User.findByIdAndUpdate(_id, { avatarURL });
  res.status(200).json({ avatarURL });
};

const verifyEmail = async (req, res) => {
  const { verificationTokenWithExpiry } = req.params;
  // eslint-disable-next-line no-unused-vars
  const [token, expiry] = verificationTokenWithExpiry.split("T");
  const currentTime = new Date().getTime();

  if (currentTime > Number(expiry)) {
    throw httpError(400, "Verification link has expired");
  }

  const user = await User.findOne({
    verificationToken: verificationTokenWithExpiry,
  });

  if (!user) {
    throw httpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  // Verification success response
  res.json({
    message: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;

  const { error } = emailValidation.validate(req.body);

  if (error) {
    throw httpError(400, error.message);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw httpError(404, "User not found");
  }

  if (user.verify) {
    throw httpError(400, "Verification has already been passed");
  }

  const verificationToken = uuid4();
  const verificationTokenWithExpiry = `${verificationToken}T${
    new Date().getTime() + 1000 * 60 * 60
  }`;

  await User.findByIdAndUpdate(user._id, {
    verificationToken: verificationTokenWithExpiry,
  });

  await sendEmail({
    to: email,
    subject: "Action Required: Verify Your Email",
    html: `
      <h1>Welcome to our service</h1>
      <p>
        To complete the registration process and have access to all the features of our service, please click the link below to verify your email address:
      </p>
      <p>
       The link will be active for 1 hour.
      </p>
      <a style="display: block; padding: 10px; background-color: #4CAF50; color: white; text-align: center; text-decoration: none;" href="http://localhost:${PORT}/api/users/verify/${verificationTokenWithExpiry}">Verify Email</a>
    `,
  });

  // Resend verification success response
  res.json({
    message: "Verification email sent",
  });
};

// prettier-ignore
export { signupUser, loginUser, logoutUser, getCurrentUsers, updateUserSubscription, updateAvatar, verifyEmail, resendVerifyEmail };
