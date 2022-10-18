const hre = require('hardhat')
const create = require('./create')
const getter = require('./getter')
const orders = require('./orders')

const contractAddress = "0xACe87165BaF7C194Ed7Ba2880c5296Ec5020912A"
const ironAddress = "0xd06F987a0dD0cCbD9A309773bA7afcA6e71AaE02"
const goldAddress = "0x6A5249c86765E75B3ACd0D899A56B9170Cc206F3"
const silverAddress = "0x63098097444285fe4741143d6fBB7Ff9CC3bFC39"
const bronzeAddress = "0x1308Cc18525bE76A72de41786360F72BB0c01966"

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

    // const feedback = await dexContract.approveAndExchangeBuy(goldAddress, silverAddress, 10, owner.address, 10);
    // console.log(feedback)
    // const feedback1 = await dexContract.getSellOrders(ironAddress);
    // console.log(feedback1)
    // const feedback2 = await dexContract.connect(actor).getUserSellOrders(ironAddress);
    // const feedback3 = await dexContract.getUserSellOrders(ironAddress);
    // console.log(feedback2)
    // console.log(feedback3)

    // const feedback2 = await dexContract.connect(actor).buyTokenMarket(goldAddress, ironAddress, 5)
    // console.log(feedback2)
    // const ironContract = await hre.ethers.getContractAt('IRON', ironAddress)
    // const approve = await goldContract.connect(actor).approve(actor.address, owner.address, 50)
    // await approve.wait()
    // const balance = await ironContract.transferFrom(actor.address, owner.address, hre.ethers.utils.parseEther("100"))
    // const balance1 = await ironContract.balanceOf(actor.address)
    // console.log(balance, balance1)
    // const balance2 = await goldContract.transfer(contractAddress, 50)
    // const balance3 = await silverContract.transfer(contractAddress, 50)
    // await balance2.wait()
    // await balance3.wait()

    const approveAndExchange = await dexContract.approveAndExchangeToken(goldAddress, silverAddress, owner.address, actor.address, 50, 50)
    await approveAndExchange.wait()

    // const approve1 = await goldContract.approve(contractAddress, actor.address, 1000)
    // const approve2 = await silverContract.approve(contractAddress, actor.address, 1000)
    // const balance2 = await goldContract.connect(actor).transferFrom(contractAddress, actor.address, 1000)
    // const balance3 = await silverContract.connect(actor).transferFrom(contractAddress, actor.address, 1000)
    // await approve1.wait()
    // await approve2.wait()
    // await balance2.wait()
    // await balance3.wait()
    // const balance3 = await goldContract.balanceOf('0x0FA7AC60b6596d0cD1e6D49C6FCe5f05f0F9B39')
    // console.log(balance, balance1, balance2, balance3)
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
  fastify.post('/contract/interactToken', async (request, reply) => {
    await contractInteractToken(request, reply)
  })
  fastify.post('/contract/interact', async (request, reply) => {
    await contractInteractLogic(request, reply)
  })
}

module.exports = dex
