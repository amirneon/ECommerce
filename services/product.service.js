// const db = require("../db");
// const { MyError } = require("../error");

// async function newProductList() {
//   try {
//     const products = await db.product.findMany({
//       select: {
//         name: true,
//         category: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// async function newinStockProducts() {
//   try {
//     const products = await db.product.findMany({
//       select: {
//         name: true,
//         ProductPrice: {
//           where: {
//             qty: { not: 0 },
//           },
//           select: {
//             price: true, // chera price ro string neshon mide ?
//             qty: true,
//             seller: {
//               select: {
//                 name: true,
//               },
//             },
//           },
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// async function newCreateProduct(products, SellerUsername, next) {
//   try {
//     const { attributes, types, values, name, categoryName, price, qty } =
//       products;
//     console.log(products);
//     const category = await db.category.findFirst({
//       where: { name: categoryName },
//     });
//     if (!category.id) {
//       throw new MyError("Category vojod nadarad!", 400);
//     } //TODO: kar nemikone va inke chekar konim be inja berese aslan ?

//     const checkProduct = await db.product.findFirst({ where: { name: name } });
//     if (checkProduct) {
//       throw new MyError("Product Ghablan vojod dashte ast!", 400);
//     }

//     // validation baraye attribute ha va type ha vali bayad kamel tar beshe //TODO: unit handle nashode!
//     for (let j = 0; j < attributes.length; j++) {
//       let ckeckAttributeAndType = await db.attribute.findFirstOrThrow({
//         where: {
//           name: attributes[j],
//           type: types[j],
//         },
//       });
//       if (!ckeckAttributeAndType) {
//         throw new MyError(
//           `Attribute ${attributes[j]} ba Type ${types[j]} vojod nadarad!`,
//           400
//         );
//       }
//     }

//     // create Product
//     const newProduct = await db.product.create({
//       data: { name, categoryId: category.id },
//     });

//     // por kardane productAttribute
//     for (let i = 0; i < attributes.length; i++) {
//       // if (!allAttributes.includes(attributes[i])) {
//       //   throw new MyError("Attribute Vojod Nadarad!", 400);
//       // } // age intori bnvisim age attribute chandomin ozv araye attributi bashe ke vojod nadashte bashe onmoqe ghabliash create shode fkr konm
//       let findAttribute = await db.attribute.findFirstOrThrow({
//         where: {
//           name: attributes[i],
//           type: types[i],
//         },
//       });
//       let productAttribute = await db.productAttribute.create({
//         where: {
//           productId_attributeId: {
//             productId: newProduct.id,
//             attributeId: findAttribute.id,
//           },
//         },
//         data: {
//           productId: newProduct.id,
//           attributeId: findAttribute.id,
//           value: values[i], // value dakhele prisma string tarif shode va in khoob nist bnzrm choon age value int bood nmizare int vared konim va baraye search shayad moshkel saz beshe
//         },
//       });
//     }

//     // find seller for his Id
//     const seller = await db.seller.findFirstOrThrow({
//       where: { username: SellerUsername },
//     });

//     // por kardane prodcutPrice
//     const prodcutPrice = await db.productPrice.create({
//       data: {
//         productId: newProduct.id,
//         sellerId: seller.id,
//         price,
//         qty,
//       },
//     });

//     const product = await db.product.findFirstOrThrow({
//       where: {
//         id: newProduct.id,
//       },
//       select: {
//         name: true,
//         category: {
//           select: {
//             name: true,
//           },
//         },
//         ProductAttribute: {
//           select: {
//             attribute: {
//               select: {
//                 name: true,
//               },
//             },
//             value: true,
//           },
//         },
//         ProductPrice: {
//           select: {
//             seller: {
//               select: {
//                 name: true,
//               },
//             },
//             price: true,
//             qty: true,
//           },
//         },
//       },
//     });

//     return product;
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// }
// module.exports = {
//   newCreateProduct,
//   newProductList,
//   newinStockProducts,
// };
