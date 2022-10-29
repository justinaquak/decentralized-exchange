const hre = require("hardhat");
const {
  contractAddress,
  goldAddress,
  silverAddress,
  bronzeAddress,
} = require("../constants.js");
const AMOUNT = 10000;

const tokenNames = ["GOLD", "SILVER", "BRONZE"];
const tokenAddresses = [goldAddress, silverAddress, bronzeAddress];

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

async function addressTransferLogic(req, res) {
  const userAddress = getUserAddress(req.query.user);

  let contract;
  let transfer;
  const transferToken = async () => {
    for (let i = 0; i < tokenNames.length, i++; ) {
      contract = await hre.etheres.getContractAt(
        tokenNames[i],
        tokenAddresses[i]
      );
      transfer = await contract.transfer(userAddress, AMOUNT);
      await transfer.wait();
    }
  };

  try {
    await transferToken();
    res.code(200).header("Content-Type", "application/json; charset=utf-8");
  } catch (err) {
    res.code(400).send(err);
  }
}

async function contractTransferLogic(req, res) {
  let contract;
  let transfer;
  const transferToken = async () => {
    for (let i = 0; i < tokenNames.length, i++; ) {
      contract = await hre.etheres.getContractAt(
        tokenNames[i],
        tokenAddresses[i]
      );
      transfer = await contract.transfer(contractAddress, AMOUNT);
      await transfer.wait();
    }
  };

  try {
    await transferToken();
    res.code(200).header("Content-Type", "application/json; charset=utf-8");
  } catch (err) {
    res.code(400).send(err);
  }
}

async function faucet(req, res) {
  const faucetRequest = async () => {
    let user = await getUser(req.query.user);
    let userAddress = await getUserAddress(req.query.user);
    const goldContract = await hre.ethers.getContractAt("GOLD", goldAddress);
    const transferGold = await goldContract
      .connect(user)
      .faucet(await getUserAddress("owner"), userAddress);
    await transferGold.wait();
    const goldResult = await goldContract.getResult();
    const silverContract = await hre.ethers.getContractAt(
      "SILVER",
      silverAddress
    );
    const transferSilver = await silverContract
      .connect(user)
      .faucet(await getUserAddress("owner"), userAddress);
    await transferSilver.wait();
    const silverResult = await silverContract.getResult();
    const bronzeContract = await hre.ethers.getContractAt(
      "BRONZE",
      bronzeAddress
    );
    const transferBronze = await bronzeContract
      .connect(user)
      .faucet(await getUserAddress("owner"), userAddress);
    await transferBronze.wait();
    const bronzeResult = await bronzeContract.getResult();

    if (goldResult && silverResult && bronzeResult) {
      return [true, "Faucet request successful."];
    } else {
      throw new Error(
        "Faucet request failed, please request only after 2 minutes."
      );
    }
  };

  try {
    const result = await faucetRequest();
    res
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ result: result[0], message: result[1] });
  } catch (err) {
    res.code(400).send(err);
  }
}

async function transfer(fastify, options) {
  fastify.post("/contract", async (request, reply) => {
    await contractTransferLogic(request, reply);
  });
  fastify.post("/address", async (request, reply) => {
    await addressTransferLogic(request, reply);
  });
  fastify.post("/faucet", async (request, reply) => {
    await faucet(request, reply);
  });
}

module.exports = transfer;
