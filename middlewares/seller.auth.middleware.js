const { MyError } = require("../error");
const jwt = require("jsonwebtoken");

const db = require("../db");

// const { UserService } = require("../services");

// const userService = new UserService();

const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      // console.log("+++++++++++++", authorization);
      throw new MyError("token dar header lazeme", 401);
    }
    const token = authorization.split(" ")[1];
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    if (payload) {
      // console.log("+++++++++++++++++", payload);
      const username = payload.username;
      const seller = await db.seller.findUnique({
        where: { username },
      });
      console.log(payload.username);
      req.user = seller;
      next();
      // return res.send(user);
      // TODO: add service!
      // req.user = user;
      // next();
    }
    // next(); // ?
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
