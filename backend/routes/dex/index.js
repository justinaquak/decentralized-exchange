const hre = require('hardhat')
const create = require('./create')
const getter = require('./getter')
const orders = require('./orders')
const transfer = require('./transfer')

const {contractAddress, ironAddress, goldAddress, silverAddress, bronzeAddress} = require('./constants.js')

async function contractInteractToken(req, res) {
  const preResponse = async () => {
    return
  }

  try {
    await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8')
  } catch (err) {
    res.code(400).send(err)
  }
}

async function contractInteractLogic(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt('Dex', contractAddress)
    const ironContract = await hre.ethers.getContractAt('IRON', ironAddress)
    const goldContract = await hre.ethers.getContractAt('GOLD', goldAddress)
    const silverContract = await hre.ethers.getContractAt('SILVER', silverAddress)
    const bronzeContract = await hre.ethers.getContractAt('BRONZE', bronzeAddress)

    const [owner, actor] = await hre.ethers.getSigners()

    // const buyTokenLimit = await dexContract.buyTokenLimit(goldAddress, silverAddress, 100, 10, 1000);
    // await buyTokenLimit.wait()
    // const sellTokenMarket = await dexContract.sellTokenMarket(goldAddress, silverAddress, 7, 1000);
    // await sellTokenMarket.wait()
    // const sellTokenMarket1 = await dexContract.sellTokenLimit(goldAddress, silverAddress, 100, 5, 1000);
    // await sellTokenMarket1.wait()

    // const tokenPrice = await silverContract.balanceOf(contractAddress)
    // console.log(tokenPrice)

    // APPROVES AND REDUCE AND BALANCE
    // const approve = await goldContract.approve(owner.address, actor.address, 1000)
    // await approve.wait()

    // const reduce = await goldContract.reduceAllowance(owner.address, actor.address, 1000)
    // await reduce.wait()

    // const balance = await goldContract.allowance(owner.address, actor.address)
    // console.log(balance)
    return
  }

  try {
    await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8')
  } catch (err) {
    res.code(400).send(err)
  }
}

async function dex(fastify, options) {
  fastify.register(create, { prefix: '/create' })
  fastify.register(getter, { prefix: '/get' })
  fastify.register(orders, { prefix: '/orders' })
  fastify.register(transfer, { prefix: '/transfer' })
  fastify.post('/contract/interactToken', async (request, reply) => {
    await contractInteractToken(request, reply)
  })
  fastify.post('/contract/interact', async (request, reply) => {
    await contractInteractLogic(request, reply)
  })
}

module.exports = dex