const express = require("express");
const { userController } = require("../controllers");
const { userAuthentication } = require("../middlewares");

const router = express.Router();

router.route("/").get(userController.userList);
router.route("/login").post(userController.login);

router
  .route("/myProfile")
  .get(userAuthentication, userController.getUserByToken)
  .put(userAuthentication, userController.updateUser)
  .delete(userAuthentication, userController.deleteUser);

router.post("/register", userController.register);
router.get("/myBasket", userAuthentication, userController.userBasketList);
router
  .route("/attribute")
  .get(userController.attributeList)
  .post(userAuthentication, userController.createAttribute)
  .put(userAuthentication, userController.updateAttribute)
  .delete(userAuthentication, userController.deleteAttribute);
router.get(
  "/myFinalOrders",
  userAuthentication,
  userController.userFinalOrdersList
);

router.route("/:username").get(userController.getUserByReqParams);

module.exports = router;
