const express = require("express");
const { productController } = require("../controllers");
const { sellerAuthentication } = require("../middlewares");
const { userAuthentication } = require("../middlewares");

const router = express.Router();

router
  .route("/")
  .get(productController.productsList)
  .post(sellerAuthentication, productController.createProduct)
  .delete(userAuthentication, productController.deleteProduct)
  .put(sellerAuthentication, productController.updateProduct);
router.get("/getProduct/:productId", productController.productDetail);
router.get("/inStockProducts", productController.inStockProducts);

module.exports = router;
