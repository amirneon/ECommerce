// const { MyError } = require("../error");
// const jwt = require("jsonwebtoken");
// const { UserService } = require("../services");

// const userService = new UserService();

// const authentication = async (req, res, next) => {
//   try {
//     const { authorization } = req.headers;
//     if (!authorization) {
//       // console.log("+++++++++++++", authorization);
//       throw new MyError("token dar header lazeme", 401);
//     }
//     const token = authorization.split(" ")[1];
//     const payload = jwt.verify(token, process.env.SECRET_KEY);
//     if (payload) {
//       const username = payload.username;
//       const user = await userService.getUserByUsername(username);
//       req.user = user;
//       next();
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = authentication;

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
      const user = await db.user.findUnique({
        where: { username },
      });
      req.user = user;
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
