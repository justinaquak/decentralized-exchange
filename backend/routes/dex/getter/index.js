const hre = require('hardhat')
const {contractAddress, goldAddress, silverAddress, bronzeAddress} = require('../constants.js')

async function getByBuySellOrder(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt('Dex', contractAddress)
    const [owner, actor] = await hre.ethers.getSigners()

    const goldBuyOrders = await dexContract.getBuyOrders(goldAddress);
    const goldSellOrders = await dexContract.getSellOrders(goldAddress);
    const silverBuyOrders = await dexContract.getBuyOrders(silverAddress);
    const silverSellOrders = await dexContract.getSellOrders(silverAddress);
    const bronzeBuyOrders = await dexContract.getBuyOrders(bronzeAddress);
    const bronzeSellOrders = await dexContract.getSellOrders(bronzeAddress);

    console.log('\nGOLD BUY\n', goldBuyOrders)
    console.log('\nGOLD SELL\n', goldSellOrders)
    console.log('\nSILVER BUY\n', silverBuyOrders)
    console.log('\nSILVER SELL\n', silverSellOrders)
    console.log('\nBRONZE BUY\n', bronzeBuyOrders)
    console.log('\nBRONZE SELL\n', bronzeSellOrders)

    return
  }

  try {
    await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({message: true})
  } catch (err) {
    res.code(400).send(err)
  }
}

async function getByUserBuySellOrder(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt('Dex', contractAddress)
    const [owner, actor] = await hre.ethers.getSigners()

    const goldBuyOrders = await dexContract.getUserBuyOrders(goldAddress);
    const goldSellOrders = await dexContract.getUserSellOrders(goldAddress);
    const silverBuyOrders = await dexContract.getUserBuyOrders(silverAddress);
    const silverSellOrders = await dexContract.getUserSellOrders(silverAddress);
    const bronzeBuyOrders = await dexContract.getUserBuyOrders(bronzeAddress);
    const bronzeSellOrders = await dexContract.getUserSellOrders(bronzeAddress);

    console.log('\nGOLD BUY\n', goldBuyOrders)
    console.log('\nGOLD SELL\n', goldSellOrders)
    console.log('\nSILVER BUY\n', silverBuyOrders)
    console.log('\nSILVER SELL\n', silverSellOrders)
    console.log('\nBRONZE BUY\n', bronzeBuyOrders)
    console.log('\nBRONZE SELL\n', bronzeSellOrders)

    return
  }

  try {
    await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ message: true })
  } catch (err) {
    res.code(400).send(err)
  }
}

async function getter(fastify, options) {
  fastify.post('/orders', async (request, reply) => {
    await getByBuySellOrder(request, reply)
  })
  fastify.post('/userOrders', async (request, reply) => {
    await getByUserBuySellOrder(request, reply)
  })
}

module.exports = getter
