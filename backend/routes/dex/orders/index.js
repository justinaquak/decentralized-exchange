const hre = require('hardhat')

const contractAddress = "0xACe87165BaF7C194Ed7Ba2880c5296Ec5020912A"
const ironAddress = "0xd06F987a0dD0cCbD9A309773bA7afcA6e71AaE02"
const goldAddress = "0x6A5249c86765E75B3ACd0D899A56B9170Cc206F3"
const silverAddress = "0x63098097444285fe4741143d6fBB7Ff9CC3bFC39"
const bronzeAddress = "0x1308Cc18525bE76A72de41786360F72BB0c01966"

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
    const buyOrder = await dexContract.approveAndExchangeToken(goldAddress, silverAddress, owner.address, actor.address, 50, 50)
    await buyOrder.wait()
    return
  }

  try {
    await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8')
  } catch (err) {
    res.code(400).send(err)
  }
}

async function orders(fastify, options) {
  fastify.post('/token', async (request, reply) => {
    await contractCreateToken(request, reply)
  })
  fastify.post('/contract', async (request, reply) => {
    await contractCreateLogic(request, reply)
  })
}

module.exports = orders