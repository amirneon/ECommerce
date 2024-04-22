const db = require("../db");
const bc = require("bcrypt");
const { createToken } = require("../utils");

const { MyError } = require("../error");

exports.sellerList = async (req, res, next) => {
  try {
    const sellers = await db.seller.findMany({
      select: {
        name: true,
        email: true,
        // phoneNumber: true,
      },
    });
    res.json(sellers);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const seller = await db.seller.findFirstOrThrow({ where: { username } });
    if (!seller) {
      throw new MyError("username or password is incorrect", 400);
    }
    const verified = await bc.compare(password, seller.password);
    if (!verified) {
      throw new MyError("username or password is incorrect", 400);
    }
    const token = await createToken(
      { username },
      process.env.SECRET_KEY,
      process.env.REFRESH_TOKEN_TIME,
      process.env.ACCESS_TOKEN_TIME
      // username
    );
    return res.json({
      token,
    });
  } catch (e) {
    // TODO: Error handler!
    next(e);
    // console.log(e);
  }
};

exports.getSellerByToken = async (req, res, next) => {
  try {
    const { username } = req.user; // req.seller darim ?
    const seller = await db.seller.findFirstOrThrow({
      where: { username },
      select: {
        name: true,
        username: true,
        phoneNumber: true,
        email: true,
        ProductPrice: {
          select: {
            product: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            price: true,
            qty: true,
          },
        },
      },
    });
    // if (!seller) {
    //   return res.status(404).json({ error: "فروشنده یافت نشد" });
    // } // chejori ino handle konim ?
    res.json({
      seller,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSellerByReqParams = async (req, res, next) => {
  try {
    const { username } = req.params;
    const seller = await db.seller.findFirst({
      where: { username },
      select: {
        username: true,
        email: true,
      },
    });
    res.json(seller);
  } catch (error) {
    next(error);
  }
};

exports.createSeller = async (req, res, next) => {
  try {
    const { name, username, email, phoneNumber, password } = req.body;
    const salt = await bc.genSalt(10);
    const hashedPasssword = await bc.hash(password, salt);
    const createSeller = await db.seller.create({
      data: { name, username, email, phoneNumber, password: hashedPasssword },
    });
    res.json({
      status: 200,
      msg: `Seller ${name} has been created successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSeller = async (req, res, next) => {
  try {
    const { username } = req.user;
    const findSeller = await db.seller.findFirstOrThrow({
      where: { username },
    });
    const deleteSeller = await db.seller.delete({
      where: { id: findSeller.id },
    });
    res.json({
      status: 200,
      msg: `Seller ${username} has been deleted successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSeller = async (req, res, next) => {
  try {
    const { username } = req.user;
    const { name, email, phoneNumber } = req.body;
    const findSeller = await db.seller.findFirstOrThrow({
      where: { username },
    });
    const updateSeller = await db.seller.update({
      where: { id: findSeller.id },
      data: { name, email, phoneNumber },
    });
    const findUpdatedSeller = await db.seller.findFirstOrThrow({
      where: { username },
      select: {
        name: true,
        email: true,
        phoneNumber: true,
      },
    });
    res.json({
      status: 200,
      msg: findUpdatedSeller,
    });
  } catch (error) {
    next(error);
  }
};

// in bayad inja bashe ? va injori bayad zade beshe ?
exports.updateProductPriceAndQty = async (req, res, next) => {
  try {
    const { username } = req.user;
    const { productName, price, qty } = req.body;
    const findSeller = await db.seller.findFirstOrThrow({
      where: { username },
    });
    const findProduct = await db.product.findFirstOrThrow({
      where: { name: productName },
    });
    const findProductPrice = await db.productPrice.findFirstOrThrow({
      // age haminja bznim payinio nemifhame ? chon id jadvalo behesh nadadim roye methode update ?
      where: { productId: findProduct.id, sellerId: findSeller.id }, // ba inke to prisma unique nakardim jofte in field ha ba ham ro bazam javab mide tabieye ?
    });
    const updateProductPriceAndQty = await db.productPrice.update({
      //   where: { productId: findProduct.id, sellerId: findSeller.id }, // chera intori nemishe ?
      where: { id: findProductPrice.id },
      data: { price, qty },
    });
    const findUpdateProductPriceAndQty = await db.productPrice.findFirstOrThrow(
      {
        where: { id: updateProductPriceAndQty.id },
        select: {
          product: {
            select: {
              name: true,
              //   category: true, // bashe ya nabashe ?
            },
          },
          seller: {
            select: {
              name: true,
              phoneNumber: true,
            },
          },
          price: true,
          qty: true,
        },
      }
    ); // injori behtar bood bnvisim ya khodemon 1 object dorost konim o neshonesh bdim o enqad query nazanim ?
    res.json({
      status: 200,
      msg: findUpdateProductPriceAndQty,
    });
  } catch (error) {
    next(error);
  }
};
