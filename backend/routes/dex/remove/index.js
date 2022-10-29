const hre = require("hardhat");
const {
  contractAddress,
  goldAddress,
  silverAddress,
  bronzeAddress,
} = require("../constants.js");
const goldValue = 100;
const silverValue = 10;
const bronzeValue = 1;

async function getUser(user) {
  const [owner, actor, third] = await hre.ethers.getSigners();
  if (user == "owner") {
    return owner;
  } else if (user == "actor") {
    return actor;
  } else if (user == "third") {
    return third;
  }
}

async function getUserAddress(user) {
  const [owner, actor, third] = await hre.ethers.getSigners();
  if (user == "owner") {
    return owner.address;
  } else if (user == "actor") {
    return actor.address;
  } else if (user == "third") {
    return third.address;
  }
}

// const cancelOrder = await dexContract.connect(owner).cancelUserSellOrder(silverAddress, owner.address, 100, 1000);
async function removeBuyOrder(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt("Dex", contractAddress);

    let tokenA = req.query.tokenA;
    let tokenB = req.query.tokenB;
    let tokenBAdd = getAddress(tokenB);
    let tokenBPrice = req.query.tokenBPrice;
    let tokenAValue = getValue(tokenA);
    let user = await getUser(req.query.user);
    const cancelOrder = await dexContract
      .connect(user)
      .cancelUserBuyOrder(
        tokenBAdd,
        getUserAddress(req.query.user),
        tokenBPrice,
        tokenAValue
      );
    await cancelOrder.wait();
    const result = await dexContract.getResult();
    const quantity = await dexContract.getQuantity();
    if (result) {
      return `Order of ${quantity} ${tokenB} has been cancelled`;
    } else {
      throw new Error("Order not found");
    }
  };

  try {
    const feedback = await preResponse();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ result: true, message: feedback.message });
  } catch (err) {
    res.code(400).send(err);
  }
}

// const cancelOrder = await dexContract.connect(owner).cancelUserSellOrder(silverAddress, owner.address, 100, 1000);
async function removeSellOrder(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt("Dex", contractAddress);

    let tokenA = req.query.tokenA;
    let tokenB = req.query.tokenB;
    let tokenBAdd = getAddress(tokenB);
    let tokenBPrice = req.query.tokenBPrice;
    let tokenAValue = getValue(tokenA);
    let user = await getUser(req.query.user);
    const cancelOrder = await dexContract
      .connect(user)
      .cancelUserSellOrder(
        tokenBAdd,
        getUserAddress(req.query.user),
        tokenBPrice,
        tokenAValue
      );
    await cancelOrder.wait();
    const result = await dexContract.getResult();
    const quantity = await dexContract.getQuantity();
    if (result) {
      return `Order of ${quantity} ${tokenB} has been cancelled`;
    } else {
      throw new Error("Order not found");
    }
  };

  try {
    const feedback = await preResponse();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ result: true, message: feedback.message });
  } catch (err) {
    res.code(400).send(err);
  }
}

const getAddress = (tokenName) => {
  let contractAddress;
  switch (tokenName) {
    case "GOLD":
      contractAddress = goldAddress;
      break;
    case "SILVER":
      contractAddress = silverAddress;
      break;
    case "BRONZE":
      contractAddress = bronzeAddress;
      break;
  }
  return contractAddress;
};

const getValue = (tokenName) => {
  let value;
  switch (tokenName) {
    case "GOLD":
      value = goldValue;
      break;
    case "SILVER":
      value = silverValue;
      break;
    case "BRONZE":
      value = bronzeValue;
      break;
  }
  return value;
};

async function orders(fastify, options) {
  fastify.post("/buyOrder", async (request, reply) => {
    await removeBuyOrder(request, reply);
  });
  fastify.post("/sellOrder", async (request, reply) => {
    await removeSellOrder(request, reply);
  });
}

module.exports = orders;
