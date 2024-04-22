const db = require("../db");
const { MyError } = require("../error");
// const bc = require("bcrypt");
// const { createToken } = require("../utils");

exports.productsList = async (req, res, next) => {
  try {
    const products = await db.product.findMany({
      select: {
        name: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

exports.productDetail = async (req, res, next) => {
  try {
    const { productId } = req.params; // ??????????????????????????????
    // TODO: az dakhele req.query bayad be sorate slug bde va detail mishe price va ... ??
    const product = await db.product.findFirstOrThrow({
      where: { id: productId },
      select: {
        name: true,
        category: {
          select: {
            name: true,
          },
        },
        ProductPrice: {
          select: {
            price: true,
            qty: true,
            seller: {
              select: {
                name: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    res.json({ product });
  } catch (error) {
    next(error);
  }
};

exports.inStockProducts = async (req, res, next) => {
  try {
    const products = await db.product.findMany({
      select: {
        name: true,
        ProductPrice: {
          where: {
            qty: { not: 0 },
          },
          select: {
            price: true, // chera price ro string neshon mide ?
            qty: true,
            seller: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    res.json(products); // {} bezarim che farghi mikone ?
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { username } = req.user;
    const { attributes, types, values, name, categoryName, price, qty } =
      req.body;
    // const allAttributes = await db.attribute.findMany({});
    // validation niyaze !

    const category = await db.category.findFirst({
      where: { name: categoryName },
    });
    if (!category.id) {
      throw new MyError("Category vojod nadarad!", 400);
    } //TODO: kar nemikone va inke chekar konim be inja berese aslan ?

    const checkProduct = await db.product.findFirst({ where: { name: name } });
    if (checkProduct) {
      throw new MyError("Product Ghablan vojod dashte ast!", 400);
    }

    // validation baraye attribute ha va type ha vali bayad kamel tar beshe //TODO: unit handle nashode!
    for (let j = 0; j < attributes.length; j++) {
      let ckeckAttributeAndType = await db.attribute.findFirstOrThrow({
        where: {
          name: attributes[j],
          type: types[j],
        },
      });
      if (!ckeckAttributeAndType) {
        throw new MyError(
          `Attribute ${attributes[j]} ba Type ${types[j]} vojod nadarad!`,
          400
        );
      }
    }

    // create Product
    const newProduct = await db.product.create({
      data: { name, categoryId: category.id },
    });

    // por kardane productAttribute
    for (let i = 0; i < attributes.length; i++) {
      // if (!allAttributes.includes(attributes[i])) {
      //   throw new MyError("Attribute Vojod Nadarad!", 400);
      // } // age intori bnvisim age attribute chandomin ozv araye attributi bashe ke vojod nadashte bashe onmoqe ghabliash create shode fkr konm
      let findAttribute = await db.attribute.findFirstOrThrow({
        where: {
          name: attributes[i],
          type: types[i],
        },
      });
      let productAttribute = await db.productAttribute.create({
        where: {
          productId_attributeId: {
            productId: newProduct.id,
            attributeId: findAttribute.id,
          },
        },
        data: {
          value: values[i], // value dakhele prisma string tarif shode va in khoob nist bnzrm choon age value int bood nmizare int vared konim va baraye search shayad moshkel saz beshe
        },
      });
    }

    // find seller for his Id
    const seller = await db.seller.findFirstOrThrow({
      where: { username },
    });

    // por kardane prodcutPrice
    const prodcutPrice = await db.productPrice.create({
      data: {
        productId: newProduct.id,
        sellerId: seller.id,
        price,
        qty,
      },
    });

    const product = await db.product.findFirstOrThrow({
      where: {
        id: newProduct.id,
      },
      select: {
        name: true,
        category: {
          select: {
            name: true,
          },
        },
        ProductAttribute: {
          select: {
            attribute: {
              select: {
                name: true,
              },
            },
            value: true,
          },
        },
        ProductPrice: {
          select: {
            seller: {
              select: {
                name: true,
              },
            },
            price: true,
            qty: true,
          },
        },
      },
    });

    res.json({
      status: "Product has been successfully craeted!",
      msg: product,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  // faghat tavasote admin bashe ? seller faghat betone mojodie prodcutesho 0 kone ya nahayat darkhast bzne ke admin pakesh kone ?
  try {
    const { username } = req.user;
    const { name } = req.body; // need slug!
    const findUser = await db.user.findFirstOrThrow({
      where: {
        username,
        role: "Admin",
      },
    });
    if (!findUser) {
      throw new MyError(`User ${username} in dastresi ra nadarad!`, 400); // age user vojod nadasht chejori handle konim erroremono ?
    }
    const findProduct = await db.product.findFirstOrThrow({
      where: {
        name,
      },
    });
    const product = await db.product.delete({
      where: {
        id: findProduct.id, // vaghan bedone inke id ro dar biarim javab nmide ?
      },
    });
    res.json({
      status: "Successfull",
      msg: `Product ${name} has been deleted!`,
    });
  } catch (error) {
    next(error);
  }
}; // chejori vaghti user register mishe va badesh log in mikone va bad deletesh mikonim az hamin access token mitonim estfde konim ke age dobare besazimesh dobare ba hamin access pakesh konim ??

exports.updateProduct = async (req, res, next) => {
  try {
    const { username } = req.user;
    const { attributes, types, values, name, newName, categoryName } = req.body; // need slug!
    const findProduct = await db.product.findFirstOrThrow({
      where: {
        name,
      },
    });
    if (!findProduct) {
      throw new MyError(`prodcut ${name} vojod nadarad!`);
    }

    const findSeller = await db.seller.findFirstOrThrow({
      where: {
        username,
      },
    });

    const findSellerByProduct = await db.productPrice.findFirstOrThrow({
      where: {
        productId: findProduct.id,
        sellerId: findSeller.id,
      },
    });

    if (!findSellerByProduct) {
      throw new MyError(
        `Seller ${username} dastresi pak kardane in product ra nadarad!`,
        400
      );
    }
    const findCategory = await db.category.findFirstOrThrow({
      where: {
        name: categoryName,
      },
    });
    if (!findCategory) {
      throw new MyError("Category vojod nadarad!", 400);
    } //TODO: kar nemikone va inke chekar konim be inja berese aslan ? TODO: service !

    // validation baraye attribute ha va type ha vali bayad kamel tar beshe //TODO: unit handle nashode!
    for (let j = 0; j < attributes.length; j++) {
      let ckeckAttributeAndType = await db.attribute.findFirstOrThrow({
        where: {
          name: attributes[j],
          type: types[j],
        },
      });
      if (!ckeckAttributeAndType) {
        throw new MyError(
          `Attribute ${attributes[j]} ba Type ${types[j]} vojod nadarad!`,
          400
        );
      }
    }

    for (let i = 0; i < attributes.length; i++) {
      let findAttribute = await db.attribute.findFirstOrThrow({
        where: {
          name: attributes[i],
          type: types[i],
        },
      });
      let updateProductAttribute = await db.productAttribute.update({
        where: {
          productId_attributeId: {
            productId: findProduct.id,
            attributeId: findAttribute.id,
          },
        },
        data: {
          value: values[i], // value dakhele prisma string tarif shode va in khoob nist bnzrm choon age value int bood nmizare int vared konim va baraye search shayad moshkel saz beshe
        },
      });
    }

    const updateProduct = await db.product.update({
      where: {
        id: findProduct.id,
      }, // vaghan bedone inke id ro dar biarim javab nmide ?
      data: {
        name: newName,
        categoryId: findCategory.id,
      },
    });

    const findUpdatedProduct = await db.product.findFirstOrThrow({
      where: {
        id: findProduct.id,
      },
      select: {
        name: true,
        category: {
          select: {
            name: true,
          },
        },
        ProductAttribute: {
          select: {
            attribute: {
              select: {
                name: true,
              },
            },
            value: true,
          },
        },
      },
    });
    res.json({
      status: 200, // ?
      msg: findUpdatedProduct,
    });
  } catch (error) {
    next(error);
  }
};
