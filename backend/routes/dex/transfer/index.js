const hre = require('hardhat')
const {contractAddress, goldAddress, silverAddress, bronzeAddress} = require('../constants.js')
const AMOUNT = 10000

const tokenNames = ["GOLD", "SILVER", "BRONZE"]
const tokenAddresses = [goldAddress, silverAddress, bronzeAddress]

async function getUser(user) {
  const [owner, actor, third] = await hre.ethers.getSigners()
  if (user == "owner") {
    return owner
  } else if (user == "actor") {
    return actor
  } else if (user == "third") {
    return third
  }
}

async function getUserAddress(user) {
  const [owner, actor, third] = await hre.ethers.getSigners()
  if (user == "owner") {
    return owner.address
  } else if (user == "actor") {
    return actor.address
  } else if (user == "third") {
    return third.address
  }
}

async function addressTransferLogic(req, res) {
  const userAddress = getUserAddress(req.query.user)

  let contract
  let transfer
  const transferToken = async () => {
    for (let i = 0; i < tokenNames.length, i++;) {
      contract = await hre.etheres.getContractAt(tokenNames[i], tokenAddresses[i])
      transfer = await contract.transfer(userAddress, AMOUNT)
      await transfer.wait()
    }
  }

  try {
    await transferToken();
    res.code(200).header('Content-Type', 'application/json; charset=utf-8')
  } catch (err) {
    res.code(400).send(err)
  }
}

async function contractTransferLogic(req, res) {
  let contract
  let transfer
  const transferToken = async () => {
    for (let i = 0; i < tokenNames.length, i++;) {
      contract = await hre.etheres.getContractAt(tokenNames[i], tokenAddresses[i])
      transfer = await contract.transfer(contractAddress, AMOUNT)
      await transfer.wait()
    }
  }

  try {
    await transferToken();
    res.code(200).header('Content-Type', 'application/json; charset=utf-8')
  } catch (err) {
    res.code(400).send(err)
  }
}

async function faucet(req, res) {
  const faucetRequest = async () => {
    let user = await getUser(req.query.user)
    const contract = await hre.ethers.getContractAt('Dex', contractAddress)
    const transfer = await contract.connect(user).faucet(goldAddress, silverAddress, bronzeAddress, await getUserAddress("owner"))
    await transfer.wait()
    const result = await contract.getResult();
    if (result) {
      return [true, "Faucet request successful."]
    } else {
       throw new Error("Faucet request failed, please request only after 2 minutes.")
    }
  }

  try {
    const result = await faucetRequest();
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({result: result[0], message: result[1]})
  } catch (err) {
    res.code(400).send(err)
  }
}

async function transfer(fastify, options) {
    fastify.post('/contract', async (request, reply) => {
      await contractTransferLogic(request, reply)
    })
    fastify.post('/address', async (request, reply) => {
      await addressTransferLogic(request, reply)
    })
    fastify.post('/faucet', async (request, reply) => {
      await faucet(request, reply)
    })
  }
  
  module.exports = transfer
