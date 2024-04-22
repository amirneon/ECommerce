const express = require("express");
const { sellerController } = require("../controllers");
const { sellerAuthentication } = require("../middlewares");

const router = express.Router();

router
  .route("/")
  .get(sellerController.sellerList)
  .post(sellerController.createSeller)
  .delete(sellerAuthentication, sellerController.deleteSeller)
  .put(sellerAuthentication, sellerController.updateSeller);
router
  .route("/myProfile")
  .get(sellerAuthentication, sellerController.getSellerByToken); // in age payintar az khate 16 bashe vaghti darkhast bznim be in route kar nemikone va dar vaghe fekr mikone darim payini ro ejra mikonim
router.get("/:username", sellerController.getSellerByReqParams);
router.post("/login", sellerController.login);
router.put(
  "/updatePriceOrQty",
  sellerAuthentication,
  sellerController.updateProductPriceAndQty
); // esme route khobe ya avaz konim ?
// router.get("/getProduct/:productId", productController.productDetail);
// router.get("/inStockProducts", productController.inStockProducts);

module.exports = router;
