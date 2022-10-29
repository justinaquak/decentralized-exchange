const hre = require("hardhat");
const {
  contractAddress,
  goldAddress,
  silverAddress,
  bronzeAddress,
} = require("../constants.js");

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

function getToken(address) {
  if (address == goldAddress) {
    return "GOLD";
  } else if (address == silverAddress) {
    return "SILVER";
  } else if (address == bronzeAddress) {
    return "BRONZE";
  } else {
    return "";
  }
}

function parseOrders(array) {
  if (array[0].length == 0) return [];
  const pricesArr = array[0];
  const volumeArr = array[1];
  let newArr = [];
  for (let i = 0; i < pricesArr.length; i++) {
    let data = {};
    if (pricesArr[i].toString() != "0") {
      data.price = pricesArr[i].toString();
      data.volume = volumeArr[i].toString();
      newArr.push(data);
    }
  }
  return newArr;
}

function parseUserOrders(array) {
  if (array[0].length == 0) return [];
  const pricesArr = array[0];
  const volumeArr = array[1];
  const tokensArr = array[2];
  let newArr = [];
  for (let i = 0; i < pricesArr.length; i++) {
    let data = {};
    if (pricesArr[i].toString() != "0") {
      data.price = pricesArr[i].toString();
      data.volume = volumeArr[i].toString();
      data.token = getToken(tokensArr[i].toString());
      newArr.push(data);
    }
  }
  return newArr;
}

function parseBalance(value) {
  value = value.toString();
  value = value.slice(0, -18);
  return value;
}

function parsePriceInfo(array) {
  let buyPrice = array[0].toString();
  let sellPrice = array[4].toString();
  if (buyPrice == "0") {
    buyPrice = "No sell orders available";
  }
  if (sellPrice == "0") {
    sellPrice = "No buy orders available";
  }

  return [buyPrice, sellPrice];
}

function getVolumeWithSamePrice(array, price) {
  const pricesArr = array[0];
  const volumeArr = array[1];
  let volume = 0;
  for (let i = 0; i < pricesArr.length; i++) {
    if (pricesArr[i].toString() == price) {
      volume += parseInt(volumeArr[i].toString());
    }
  }
  return volume;
}

async function getVolumeByPrice(price, address, isBuy) {
  if (
    price == "No sell orders available" ||
    price == "No buy orders available"
  ) {
    return price;
  } else {
    if (isBuy) {
      const dexContract = await hre.ethers.getContractAt(
        "Dex",
        contractAddress
      );
      const buyOrders = await dexContract.getBuyOrders(address);
      const volume = getVolumeWithSamePrice(buyOrders, price);
      return volume;
    } else {
      const dexContract = await hre.ethers.getContractAt(
        "Dex",
        contractAddress
      );
      const buyOrders = await dexContract.getSellOrders(address);
      const volume = getVolumeWithSamePrice(buyOrders, price);
      return volume;
    }
  }
}

async function getOrderBooks(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt("Dex", contractAddress);

    const goldBuyOrders = await dexContract.getBuyOrders(goldAddress);
    const goldSellOrders = await dexContract.getSellOrders(goldAddress);
    const silverBuyOrders = await dexContract.getBuyOrders(silverAddress);
    const silverSellOrders = await dexContract.getSellOrders(silverAddress);
    const bronzeBuyOrders = await dexContract.getBuyOrders(bronzeAddress);
    const bronzeSellOrders = await dexContract.getSellOrders(bronzeAddress);

    let gold = {};
    let silver = {};
    let bronze = {};
    gold.buyOrders = parseOrders(goldBuyOrders);
    gold.sellOrders = parseOrders(goldSellOrders);
    silver.buyOrders = parseOrders(silverBuyOrders);
    silver.sellOrders = parseOrders(silverSellOrders);
    bronze.buyOrders = parseOrders(bronzeBuyOrders);
    bronze.sellOrders = parseOrders(bronzeSellOrders);

    return [gold, silver, bronze];
  };

  try {
    const data = await preResponse();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ gold: data[0], silver: data[1], bronze: data[2] });
  } catch (err) {
    res.code(400).send(err);
  }
}

async function getTokenPriceInfo(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt("Dex", contractAddress);

    let goldPriceInfo = await dexContract.retrieveTokenPriceInfo(goldAddress);
    let silverPriceInfo = await dexContract.retrieveTokenPriceInfo(
      silverAddress
    );
    let bronzePriceInfo = await dexContract.retrieveTokenPriceInfo(
      bronzeAddress
    );

    goldPriceInfo = parsePriceInfo(goldPriceInfo);
    silverPriceInfo = parsePriceInfo(silverPriceInfo);
    bronzePriceInfo = parsePriceInfo(bronzePriceInfo);

    let gold = {};
    let silver = {};
    let bronze = {};

    gold.buyPrice = goldPriceInfo[0];
    gold.sellPrice = goldPriceInfo[1];
    gold.buyVolume = await getVolumeByPrice(
      goldPriceInfo[0],
      goldAddress,
      false
    );
    if (gold.buyVolume == 0) {
      gold.buyPrice = "No sell orders available";
      gold.buyVolume = "No sell orders available";
    }
    gold.sellVolume = await getVolumeByPrice(
      goldPriceInfo[1],
      goldAddress,
      true
    );
    if (gold.sellVolume == 0) {
      gold.sellPrice = "No buy orders available";
      gold.sellVolume = "No buy orders available";
    }
    silver.buyPrice = silverPriceInfo[0];
    silver.sellPrice = silverPriceInfo[1];
    silver.buyVolume = await getVolumeByPrice(
      silverPriceInfo[0],
      silverAddress,
      false
    );
    if (silver.buyVolume == 0) {
      silver.buyPrice = "No sell orders available";
      silver.buyVolume = "No sell orders available";
    }
    silver.sellVolume = await getVolumeByPrice(
      silverPriceInfo[1],
      silverAddress,
      true
    );
    if (silver.sellVolume == 0) {
      silver.sellPrice = "No buy orders available";
      silver.sellVolume = "No buy orders available";
    }
    bronze.buyPrice = bronzePriceInfo[0];
    bronze.sellPrice = bronzePriceInfo[1];
    bronze.buyVolume = await getVolumeByPrice(
      bronzePriceInfo[0],
      bronzeAddress,
      false
    );
    if (bronze.buyVolume == 0) {
      bronze.buyPrice = "No sell orders available";
      bronze.buyVolume = "No sell orders available";
    }
    bronze.sellVolume = await getVolumeByPrice(
      bronzePriceInfo[1],
      bronzeAddress,
      true
    );
    if (bronze.sellVolume == 0) {
      bronze.sellPrice = "No buy orders available";
      bronze.sellVolume = "No buy orders available";
    }

    return [gold, silver, bronze];
  };

  try {
    const data = await preResponse();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ gold: data[0], silver: data[1], bronze: data[2] });
  } catch (err) {
    res.code(400).send(err);
  }
}

async function getUserOrders(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt("Dex", contractAddress);
    const user = await getUser(req.query.user);

    const goldBuyOrders = await dexContract
      .connect(user)
      .getUserBuyOrders(goldAddress);
    const goldSellOrders = await dexContract
      .connect(user)
      .getUserSellOrders(goldAddress);
    const silverBuyOrders = await dexContract
      .connect(user)
      .getUserBuyOrders(silverAddress);
    const silverSellOrders = await dexContract
      .connect(user)
      .getUserSellOrders(silverAddress);
    const bronzeBuyOrders = await dexContract
      .connect(user)
      .getUserBuyOrders(bronzeAddress);
    const bronzeSellOrders = await dexContract
      .connect(user)
      .getUserSellOrders(bronzeAddress);

    let gold = {};
    let silver = {};
    let bronze = {};
    gold.buyOrders = parseUserOrders(goldBuyOrders);
    gold.sellOrders = parseUserOrders(goldSellOrders);
    silver.buyOrders = parseUserOrders(silverBuyOrders);
    silver.sellOrders = parseUserOrders(silverSellOrders);
    bronze.buyOrders = parseUserOrders(bronzeBuyOrders);
    bronze.sellOrders = parseUserOrders(bronzeSellOrders);

    return [gold, silver, bronze];
  };

  try {
    const data = await preResponse();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ gold: data[0], silver: data[1], bronze: data[2] });
  } catch (err) {
    res.code(400).send(err);
  }
}

async function getUserBalance(req, res) {
  const preResponse = async () => {
    const userAddress = await getUserAddress(req.query.user);
    const goldContract = await hre.ethers.getContractAt("GOLD", goldAddress);
    const silverContract = await hre.ethers.getContractAt(
      "SILVER",
      silverAddress
    );
    const bronzeContract = await hre.ethers.getContractAt(
      "BRONZE",
      bronzeAddress
    );

    const goldBalance = await goldContract.balanceOf(userAddress);
    const silverBalance = await silverContract.balanceOf(userAddress);
    const bronzeBalance = await bronzeContract.balanceOf(userAddress);

    return [
      userAddress,
      parseBalance(goldBalance),
      parseBalance(silverBalance),
      parseBalance(bronzeBalance),
    ];
  };

  try {
    const data = await preResponse();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({
        address: data[0],
        gold: data[1],
        silver: data[2],
        bronze: data[3],
      });
  } catch (err) {
    res.code(400).send(err);
  }
}

async function getter(fastify, options) {
  fastify.get("/orders", async (request, reply) => {
    await getOrderBooks(request, reply);
  });
  fastify.get("/userOrders", async (request, reply) => {
    await getUserOrders(request, reply);
  });
  fastify.get("/userBalance", async (request, reply) => {
    await getUserBalance(request, reply);
  });
  fastify.get("/tokenPriceInfo", async (request, reply) => {
    await getTokenPriceInfo(request, reply);
  });
}

module.exports = getter;
