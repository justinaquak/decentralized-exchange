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

function parseMarketReceipt(feedback) {
  let result = {};
  if (feedback[0]) {
    result.result = "Fulfilled";
    result.message = "Market order was successful.";
  } else if (feedback[3]) {
    result.result = "Partial";
    if (feedback[1]) {
      result.message =
        "Market order partially fulfilled due to insufficient funds.";
    } else {
      result.message =
        "Market order partially fulfilled due to insufficient orders in the market.";
    }
  } else {
    result.result = "Failed";
    if (feedback[1]) {
      result.message = "Market order failed due to insufficient funds.";
    } else {
      result.message =
        "Market order failed due to insufficient orders in the market.";
    }
  }
  return result;
}

function parseLimitReceipt(
  storedOrder,
  tokenB = null,
  tokenBAmount = null,
  quantity = null
) {
  let result = {};
  if (storedOrder) {
    if (tokenBAmount != quantity) {
      result.result = "Partial";
      result.message = `Limit order was partially fulfilled. Order for ${quantity} ${tokenB} tokens placed.`;
    } else {
      result.result = "Failed";
      result.message = `Limit order was not fulfilled. Order for ${quantity} ${tokenB} tokens placed.`;
    }
  } else {
    result.result = "Fulfilled";
    result.message = "Limit order was successful.";
  }
  return result;
}

async function buyTokenMarket(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt("Dex", contractAddress);

    let tokenA = req.query.tokenA;
    let tokenB = req.query.tokenB;
    let tokenAAdd = getAddress(tokenA);
    let tokenBAdd = getAddress(tokenB);
    let tokenBAmount = req.query.tokenBAmount;
    let tokenAValue = getValue(tokenA);
    let user = await getUser(req.query.user);
    const buyOrder = await dexContract
      .connect(user)
      .buyTokenMarket(tokenAAdd, tokenBAdd, tokenBAmount, tokenAValue);
    await buyOrder.wait();
    const receipt = await dexContract.getFeedback();
    return parseMarketReceipt(receipt);
  };

  try {
    const feedback = await preResponse();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ result: feedback.result, message: feedback.message });
  } catch (err) {
    res.code(400).send(err);
  }
}

async function sellTokenMarket(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt("Dex", contractAddress);

    let tokenA = req.query.tokenA;
    let tokenB = req.query.tokenB;
    let tokenAAdd = getAddress(tokenA);
    let tokenBAdd = getAddress(tokenB);
    let tokenBAmount = req.query.tokenBAmount;
    let tokenAValue = getValue(tokenA);
    let user = await getUser(req.query.user);
    const sellOrder = await dexContract
      .connect(user)
      .sellTokenMarket(tokenAAdd, tokenBAdd, tokenBAmount, tokenAValue);
    await sellOrder.wait();
    const receipt = await dexContract.getFeedback();

    return parseMarketReceipt(receipt);
  };

  try {
    const feedback = await preResponse();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ result: feedback.result, message: feedback.message });
  } catch (err) {
    res.code(400).send(err);
  }
}

async function buyTokenLimit(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt("Dex", contractAddress);

    let tokenA = req.query.tokenA;
    let tokenB = req.query.tokenB;
    let tokenAAdd = getAddress(tokenA);
    let tokenBAdd = getAddress(tokenB);
    let tokenBPrice = req.query.tokenBPrice;
    let tokenBAmount = req.query.tokenBAmount;
    let tokenAValue = getValue(tokenA);
    let user = await getUser(req.query.user);
    let result = await dexContract.resetResult();
    let quantity = await dexContract.resetQuantity();
    let feedback;
    const buyOrder = await dexContract
      .connect(user)
      .buyTokenLimit(
        tokenAAdd,
        tokenBAdd,
        tokenBPrice,
        tokenBAmount,
        tokenAValue
      );
    await buyOrder.wait();
    result = await dexContract.getResult();
    quantity = (await dexContract.getQuantity()).toString();
    if (!result) {
      feedback = parseLimitReceipt(result, tokenB, tokenBAmount, quantity);
      return feedback;
    } else {
      const batchExecution = await dexContract.batchExecutionBuy(
        goldAddress,
        silverAddress,
        bronzeAddress
      );
      await batchExecution.wait();
      const numOfSets = (await dexContract.getQuantity()).toString();
      const numFulfilled = parseInt(numOfSets) * getValue(tokenB);
      const numTokenBRequired = (quantity * tokenBPrice) / tokenAValue;

      const remaining = numTokenBRequired - numFulfilled;
      if (remaining == 0) {
        feedback = parseLimitReceipt(false);
      } else {
        feedback = parseLimitReceipt(true, tokenB, tokenBAmount, quantity);
      }
      return feedback;
    }
  };

  try {
    const feedback = await preResponse();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ result: feedback.result, message: feedback.message });
  } catch (err) {
    res.code(400).send(err);
  }
}

async function sellTokenLimit(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt("Dex", contractAddress);

    let tokenA = req.query.tokenA;
    let tokenB = req.query.tokenB;
    let tokenAAdd = getAddress(tokenA);
    let tokenBAdd = getAddress(tokenB);
    let tokenBPrice = req.query.tokenBPrice;
    let tokenBAmount = req.query.tokenBAmount;
    let tokenAValue = getValue(tokenA);
    let user = await getUser(req.query.user);
    let result = await dexContract.resetResult();
    let quantity = await dexContract.resetQuantity();
    let feedback;
    const buyOrder = await dexContract
      .connect(user)
      .sellTokenLimit(
        tokenAAdd,
        tokenBAdd,
        tokenBPrice,
        tokenBAmount,
        tokenAValue
      );
    await buyOrder.wait();
    result = await dexContract.getResult();
    quantity = await dexContract.getQuantity();
    feedback = parseLimitReceipt(result, tokenB, tokenBAmount, quantity);
    return feedback;
  };

  try {
    const feedback = await preResponse();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ result: feedback.result, message: feedback.message });
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
  fastify.post("/buyTokenMarket", async (request, reply) => {
    await buyTokenMarket(request, reply);
  });
  fastify.post("/sellTokenMarket", async (request, reply) => {
    await sellTokenMarket(request, reply);
  });
  fastify.post("/buyTokenLimit", async (request, reply) => {
    await buyTokenLimit(request, reply);
  });
  fastify.post("/sellTokenLimit", async (request, reply) => {
    await sellTokenLimit(request, reply);
  });
}

module.exports = orders;
