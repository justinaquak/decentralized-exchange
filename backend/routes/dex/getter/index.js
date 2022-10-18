const hre = require('hardhat')

const contractAddress = "0xF7c6DDDf7A108d677a726A6F20e7C2724e7EFBe0"
const ironAddress = '0x74E8c338E056d18aE576DeB84adEd9Fb3b5f65F3'
const goldAddress = "0xa15916E98DA69A24c3FD2e9Da6b03bB8351D15f9"
const silverAddress = "0x3890448215221940163C75fd757Cc17DFD22b2CD"
const bronzeAddress = "0x74Af70ea185F201c6283d725473AaB2De7b6775c"

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
