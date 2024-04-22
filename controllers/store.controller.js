const { response } = require("express");
const db = require("../db");
const { MyError } = require("../error");
const axios = require("axios");

// const bc = require("bcrypt");
// const { createToken } = require("../utils");

// mohammad
exports.request = async (req, res, next) => {
  try {
    const { username } = req.user;
    const findUser = await db.user.findFirstOrThrow({
      where: {
        username,
      },
    });

    const findAddress = await db.address.findFirstOrThrow({
      where: {
        userId: findUser.id,
      },
    });

    const findBasket = await db.basket.findFirstOrThrow({
      where: {
        userId: findUser.id,
      },
    });

    const finalPricee = findBasket.price + 35;

    const createFinalOrder = await db.finalOrders.create({
      data: {
        userId: findUser.id,
        addressId: findAddress.id,
        transforFee: 35,
        finalPrice: finalPricee,
      },
    });
    let trackId;
    await axios
      .post("https://gateway.zibal.ir/v1/request", {
        merchant: "zibal",
        amount: finalPricee,
        callbackUrl: "http://localhost:3000/factor",
        orderId: createFinalOrder.id,
      })
      .then(function (response) {
        console.log(response.data);
        trackId = response.data.trackId;
      })
      .catch(function (error) {
        console.log(error);
      });
    // chejori 1 response html ro redirect konim va neshon bedim ?
    await axios
      .get(`https://gateway.zibal.ir/start/${trackId}`)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log("+++++++++++++++++++", trackId);
  } catch (error) {
    next(error);
  }
};

exports.Verify = async (req, res, next) => {
  try {
    const { trackId } = req.body;
    await axios
      .post("https://gateway.zibal.ir/v1/verify", {
        merchant: "zibal",
        trackId,
      })
      .then(function (response) {
        res.json(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    next(error);
  }
};
