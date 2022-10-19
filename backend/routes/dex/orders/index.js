const hre = require('hardhat')

const contractAddress = "0x8F37DC90353976DBe73A4Aaa8DA99Db60c34f46d"
const ironAddress = "0xd06F987a0dD0cCbD9A309773bA7afcA6e71AaE02"
const goldAddress = "0x6A5249c86765E75B3ACd0D899A56B9170Cc206F3"
const silverAddress = "0x63098097444285fe4741143d6fBB7Ff9CC3bFC39"
const bronzeAddress = "0x1308Cc18525bE76A72de41786360F72BB0c01966"
const goldValue = 1000
const silverValue = 100
const bronzeValue = 10
const ironValue = 1

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
    case "IRON":
      contractAddress = ironAddress
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
    case "IRON":
      value = ironValue
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