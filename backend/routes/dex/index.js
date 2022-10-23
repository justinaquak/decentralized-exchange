const hre = require('hardhat')
const create = require('./create')
const getter = require('./getter')
const orders = require('./orders')
const transfer = require('./transfer')

const {contractAddress, goldAddress, silverAddress, bronzeAddress} = require('./constants.js')

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
    const goldContract = await hre.ethers.getContractAt('GOLD', goldAddress)
    const silverContract = await hre.ethers.getContractAt('SILVER', silverAddress)
    const bronzeContract = await hre.ethers.getContractAt('BRONZE', bronzeAddress)

    const [owner, actor, third] = await hre.ethers.getSigners()

    const buyTokenLimit = await dexContract.connect(owner).buyTokenLimit(goldAddress, silverAddress, 100, 10, 1000);
    await buyTokenLimit.wait()
    // const buyTokenLimit1 = await dexContract.connect(actor).buyTokenLimit(silverAddress, bronzeAddress, 10, 100, 100);
    // await buyTokenLimit1.wait()
    // const buyTokenLimit2 = await dexContract.connect(actor).buyTokenLimit(bronzeAddress, goldAddress, 1000, 1, 10);
    // await buyTokenLimit2.wait()

    // const sellTokenLimit = await dexContract.connect(owner).sellTokenLimit(goldAddress, silverAddress, 100, 100, 1000);
    // await sellTokenLimit.wait()
    // const silverBuyOrders1 = await dexContract.getBuyOrders(silverAddress);
    // const silverSellOrders1 = await dexContract.getSellOrders(silverAddress);
    // console.log('\nSILVER BUY\n', silverBuyOrders1)
    // console.log('\nSILVER SELL\n', silverSellOrders1)
    // const buyTokenLimit = await dexContract.connect(actor).buyTokenLimit(goldAddress, silverAddress, 100, 130, 1000);
    // await buyTokenLimit.wait()
    // const silverBuyOrders = await dexContract.getBuyOrders(silverAddress);
    // const silverSellOrders = await dexContract.getSellOrders(silverAddress);
    // console.log('\nSILVER BUY\n', silverBuyOrders)
    // console.log('\nSILVER SELL\n', silverSellOrders)

    // APPROVES AND REDUCE AND BALANCE
    // await approve.wait()
    // const reduce = await goldContract.reduceAllowance(owner.address, actor.address, 1000)
    // await reduce.wait()
    // const balance1 = await goldContract.allowance(owner.address, contractAddress)
    // console.log(balance1)
    // const tokenPrice = await silverContract.balanceOf(contractAddress)
    // console.log(tokenPrice)

    // const balance1 = await dexContract.retrieveTokenPriceInfo(silverAddress)
    // const balance2 = await dexContract.retrieveOrderBookInfo(silverAddress, 40, true)
    // const balance3 = await dexContract.retrieveOrderInfo(silverAddress, 40, 1, true)
    // console.log(balance1)
    // console.log(balance2)
    // console.log(balance3)
    // console.log(actor.address) // 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
    // console.log(owner.address) // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
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
