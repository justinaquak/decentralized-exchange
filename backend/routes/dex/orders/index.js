const hre = require('hardhat')
const {contractAddress, goldAddress, silverAddress, bronzeAddress} = require('../constants.js')
const goldValue = 1000
const silverValue = 100
const bronzeValue = 10

// async function contractInteractToken(req, res) {
//   const preResponse = async () => {
//     return
//   }

//   try {
//     await preResponse()
//     res.code(200).header('Content-Type', 'application/json; charset=utf-8')
//   } catch (err) {
//     res.code(400).send(err)
//   }
// }

async function buyTokenMarket(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt('Dex', contractAddress);

    let tokenA = req.params.tokenA
    let tokenB = req.params.tokenB
    let tokenAAdd = getAddress(tokenA)
    let tokenBAdd = getAddress(tokenB)
    let tokenBAmount = req.params.tokenBAmount
    let tokenAValue = getValue(tokenA)
    const buyOrder = await dexContract.buyTokenMarket(tokenAAdd, tokenBAdd, tokenBAmount, tokenAValue)
    const receipt = await buyOrder.wait()
    console.log(receipt.logs)
    return receipt.logs
  }

  try {
    const receipt = await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').json({receipt: receipt})
  } catch (err) {
    res.code(400).send(err)
  }
}

const getAddress = (tokenName) => {
  let contractAddress
  switch(tokenName) {
    case "GOLD":
      contractAddress = goldAddress
      break
    case "SILVER":
      contractAddress = silverAddress
      break
    case "BRONZE":
      contractAddress = bronzeAddress
      break
  }
  return contractAddress
}

const getValue = (tokenName) => {
  let value
  switch(tokenName) {
    case "GOLD":
      value = goldValue
      break
    case "SILVER":
      value = silverValue
      break
    case "BRONZE":
      value = bronzeValue
      break
  }
  return value
}

async function orders(fastify, options) {
  fastify.post('/buyTokenMarket', async (request, reply) => {
    await buyTokenMarket(request, reply)
  })
  fastify.post('/contract', async (request, reply) => {
    await contractCreateLogic(request, reply)
  })
}

module.exports = orders