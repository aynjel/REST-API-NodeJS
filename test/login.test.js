const { describe, expect, test, jest, beforeEach } = require("@jest/globals");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/usersModel");
const { httpError } = require("../helpers/httpError");
const { ValidationError } = require("joi");
const { loginUser } = require("../controllers/usersController");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("loginUser controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn(), json: jest.fn() };
    httpError.mockClear();
    bcrypt.compare.mockClear();
    jwt.sign.mockClear();
  });

  test("should throw validation error for missing email", async () => {
    req.body = { password: "validPassword" };
    await expect(loginUser(req, res)).rejects.toThrow(ValidationError);
  });

  test("should throw validation error for missing password", async () => {
    req.body = { email: "valid@email.com" };
    await expect(loginUser(req, res)).rejects.toThrow(ValidationError);
  });

  test("should throw 401 error for invalid email", async () => {
    req.body = { email: "invalid@email.com", password: "validPassword" };
    await User.findOne.mockResolvedValueOnce(null); // Mock User.findOne to not find a user
    await expect(loginUser(req, res)).rejects.toThrow(httpError);
    expect(httpError).toHaveBeenCalledWith(401, "Email or password is wrong");
  });

  test("should throw 401 error for invalid password", async () => {
    req.body = { email: "valid@email.com", password: "invalidPassword" };
    const user = { email: "valid@email.com", password: "hashedPassword" };
    await User.findOne.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(false); // Mock bcrypt to return false
    await expect(loginUser(req, res)).rejects.toThrow(httpError);
    expect(httpError).toHaveBeenCalledWith(401, "Email or password is wrong");
  });

  test("should login successfully and return token and user data", async () => {
    req.body = { email: "valid@email.com", password: "validPassword" };
    const user = {
      email: "valid@email.com",
      password: "hashedPassword",
      subscription: "basic",
    };
    const token = "generatedToken";
    await User.findOne.mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValue(token);
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  });
});
