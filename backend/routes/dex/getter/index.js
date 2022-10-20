const hre = require('hardhat')

const contractAddress = "0x4826533B4897376654Bb4d4AD88B7faFD0C98528"
const ironAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const goldAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const silverAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
const bronzeAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"

async function getByBuySellOrder(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt('Dex', contractAddress)
    const [owner, actor] = await hre.ethers.getSigners()

    const ironBuyOrders = await dexContract.getBuyOrders(ironAddress);
    const ironSellOrders = await dexContract.getSellOrders(ironAddress);
    const goldBuyOrders = await dexContract.getBuyOrders(goldAddress);
    const goldSellOrders = await dexContract.getSellOrders(goldAddress);
    const silverBuyOrders = await dexContract.getBuyOrders(silverAddress);
    const silverSellOrders = await dexContract.getSellOrders(silverAddress);
    const bronzeBuyOrders = await dexContract.getBuyOrders(bronzeAddress);
    const bronzeSellOrders = await dexContract.getSellOrders(bronzeAddress);

    console.log('IRON BUY\n', ironBuyOrders)
    console.log('\nIRON SELL\n', ironSellOrders)
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

    const ironBuyOrders = await dexContract.getUserBuyOrders(ironAddress);
    const ironSellOrders = await dexContract.getUserSellOrders(ironAddress);
    const goldBuyOrders = await dexContract.getUserBuyOrders(goldAddress);
    const goldSellOrders = await dexContract.getUserSellOrders(goldAddress);
    const silverBuyOrders = await dexContract.getUserBuyOrders(silverAddress);
    const silverSellOrders = await dexContract.getUserSellOrders(silverAddress);
    const bronzeBuyOrders = await dexContract.getUserBuyOrders(bronzeAddress);
    const bronzeSellOrders = await dexContract.getUserSellOrders(bronzeAddress);

    console.log('IRON BUY\n', ironBuyOrders)
    console.log('\nIRON SELL\n', ironSellOrders)
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
