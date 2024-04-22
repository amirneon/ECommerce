const db = require("../db");
const bc = require("bcrypt");
const { createToken } = require("../utils");
const { MyError } = require("../error");

exports.userList = async (req, res, next) => {
  // TODO: service! And try catch for error handler .
  const users = await db.user.findMany({});
  res.json(
    users.map((user) => ({
      name: user.name,
      email: user.email,
    }))
  ); // users mage object nist ?
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, username, password } = req.body;
    const salt = await bc.genSalt(10);
    const hashedPasssword = await bc.hash(password, salt);
    const user = await db.user.create({
      data: { username, name, email, phoneNumber, password: hashedPasssword },
    });
    // if user exist what then ?
    return res.json({ msg: `user ${user.username} registerd` });
  } catch (e) {
    // TODO: Error handler!
    next(e);
    // console.log(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await db.user.findFirstOrThrow({ where: { username } });
    if (!user) {
      throw new Error("username or password is incorrect");
    }
    const verified = await bc.compare(password, user.password);
    if (!verified) {
      throw new Error("username or password is incorrect");
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

exports.getUserByReqParams = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await db.user.findFirst({
      where: { username },
      select: {
        username: true,
        email: true,
      },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.getUserByToken = async (req, res, next) => {
  try {
    const { username } = req.user;
    const user = await db.user.findFirst({
      where: { username },
      select: {
        name: true,
        username: true,
        phoneNumber: true,
        email: true,
        Address: {
          select: {
            country: true,
            city: true,
            description: true,
          },
        },
      },
    });
    // if (!user) {
    //   return res.status(404).json({ error: "کاربر یافت نشد" });
    // } // chejori ino handle konim ?
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.userFinalOrdersList = async (req, res, next) => {
  try {
    const { username } = req.user;
    const user = await db.user.findFirst({
      where: { username },
      select: {
        //TODO: select user haminja
        FinalOrders: {
          select: {
            // Address: {
            //   //  ?
            //   select: {
            //     country: true,
            //     city: true,
            //     description: true,
            //   },
            // },
            transforFee: true,
            finalPrice: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                username: true,
                Address: {
                  select: {
                    country: true,
                    city: true,
                    description: true,
                  },
                },
              },
            },
            Basket: {
              select: {
                qty: true,
                price: true,
                productPrice: {
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
                  },
                },
              },
            },
          },
        },
      },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.userBasketList = async (req, res, next) => {
  try {
    const { username } = req.user;
    const user = await db.user.findFirst({
      //TODO: find many nabayad bashe chon az user mirim va dakhele user basket 1 araye hast ?
      where: { username },
      select: {
        Basket: {
          where: { status: "Pending" },
          select: {
            createdAt: true,
            updatedAt: true,
            status: true,
            qty: true,
            price: true,
            productPrice: {
              //TODO: chejori esme productPrice ro az khoroji bardarim ?
              select: {
                product: {
                  select: {
                    name: true,
                    category: {
                      //TODO: delete category
                      select: {
                        name: true,
                        // TODO: chejori parent Id ro handle konim ? va inke az basket chejori hamin khoroji ro berim donbalesh va bgirim?
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    res.json(user.Basket);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { username } = req.user;
    await db.user.delete({
      where: {
        username,
      },
    });
    res.json("user deleted");
  } catch (error) {
    next(error);
  }
}; // chejori vaghti user register mishe va badesh log in mikone va bad deletesh mikonim az hamin access token mitonim estfde konim ke age dobare besazimesh dobare ba hamin access pakesh konim ??

exports.updateUser = async (req, res, next) => {
  try {
    const { username } = req.user;
    const { email, phoneNumber } = req.body; // chera 0 avale shomare ro dakhle phoneNumber ngah nmidare ?
    await db.user.update({
      where: {
        username,
      },
      data: {
        email: email,
        phoneNumber: phoneNumber, // age masalan email ro nade , null mishine jaye email ghabli ? age are chjori handlesh konim ?
      },
    });
    // const newUser = await getUserByToken(); // chikar konim intori befahme dg niaz be codaye pain nabashe ?
    const newUser = await db.user.findFirstOrThrow({
      // find first or throw bashe ya findfirst ?
      where: { username },
      select: {
        name: true,
        username: true,
        phoneNumber: true,
        email: true,
        Address: {
          select: {
            country: true,
            city: true,
            description: true,
          },
        },
      },
    });
    res.json(newUser);
    // res.json(user.email, user.name, user.phoneNumber, user.username); // chejori fiulter konim in object ro ke password va id ro nade
  } catch (error) {
    next(error);
  }
};

exports.createAttribute = async (req, res, next) => {
  try {
    const { username } = req.user;
    const { name, type, unit } = req.body;
    const findUser = await db.user.findFirstOrThrow({
      where: {
        username,
        role: "Admin",
      },
    });
    if (!findUser) {
      throw new MyError(
        `user ${username} dastresi be sakhtane attribute nadarad!`,
        400
      );
    } //TODO: fkr nakonm in kar kone va inke age user vojod nadasht bayad joda handle beshe

    const createAttribute = await db.attribute.create({
      data: { name, type, unit },
    }); //TODO: age in attribute ba in type vojod dasht Error handle beshe

    res.json({
      status: 200,
      msg: `Attribute ${name} has been successfully created!`,
    });
  } catch (error) {
    next(error);
  }
};

exports.attributeList = async (req, res, next) => {
  try {
    const attributes = await db.attribute.findMany({
      select: {
        name: true,
        type: true,
        unit: true,
      },
    });
    res.json({
      status: 200,
      msg: attributes,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAttribute = async (req, res, next) => {
  try {
    const { username } = req.user;
    const { name, type, unit, newName, newType, newUnit } = req.body;
    const findUser = await db.user.findFirstOrThrow({
      where: {
        username,
        role: "Admin",
      },
    });
    if (!findUser) {
      throw new MyError(
        `user ${username} dastresi be sakhtane attribute nadarad!`,
        400
      );
    } //TODO: fkr nakonm in kar kone va inke age user vojod nadasht bayad joda handle beshe

    const findAttribute = await db.attribute.findFirstOrThrow({
      where: {
        name,
        type,
        unit,
      },
    });

    const updateAttribute = await db.attribute.update({
      where: {
        id: findAttribute.id,
      },
      data: {
        name: newName,
        type: newType,
        unit: newUnit,
      },
    });

    const findUpdatedAttribute = await db.attribute.findFirstOrThrow({
      where: {
        id: findAttribute.id,
      },
      select: {
        name: true,
        type: true,
        unit: true,
      },
    });

    res.json({
      status: 200,
      msg: findUpdatedAttribute,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAttribute = async (req, res, next) => {
  try {
    const { username } = req.user;
    const { name, type, unit } = req.body;
    const findUser = await db.user.findFirstOrThrow({
      where: {
        username,
        role: "Admin",
      },
    });
    if (!findUser) {
      throw new MyError(
        `user ${username} dastresi be sakhtane attribute nadarad!`,
        400
      );
    } //TODO: fkr nakonm in kar kone va inke age user vojod nadasht bayad joda handle beshe

    const findAttribute = await db.attribute.findFirstOrThrow({
      where: {
        name,
        type,
        unit,
      },
    });

    const deleteAttribute = await db.attribute.delete({
      where: {
        id: findAttribute.id,
      },
    });

    res.json({
      status: 200,
      msg: `Attribute ${name} has been successfully deleted!`,
    });
  } catch (error) {
    next(error);
  }
};
