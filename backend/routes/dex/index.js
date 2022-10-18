const hre = require('hardhat')
const create = require('./create')
const getter = require('./getter')

const contractAddress = "0xF7c6DDDf7A108d677a726A6F20e7C2724e7EFBe0"
const ironAddress = '0x74E8c338E056d18aE576DeB84adEd9Fb3b5f65F3'
const goldAddress = "0xa15916E98DA69A24c3FD2e9Da6b03bB8351D15f9"
const silverAddress = "0x3890448215221940163C75fd757Cc17DFD22b2CD"
const bronzeAddress = "0x74Af70ea185F201c6283d725473AaB2De7b6775c"

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

    const feedback = await dexContract.getBuyOrders(goldAddress);
    console.log(feedback)
    const feedback1 = await dexContract.getSellOrders(ironAddress);
    console.log(feedback1)
    const feedback2 = await dexContract.connect(actor).getUserSellOrders(ironAddress);
    const feedback3 = await dexContract.getUserSellOrders(ironAddress);
    console.log(feedback2)
    console.log(feedback3)

    // const feedback2 = await dexContract.connect(actor).buyTokenMarket(goldAddress, ironAddress, 5)
    // console.log(feedback2)
    // const ironContract = await hre.ethers.getContractAt('IRON', ironAddress)
    // const approve = await ironContract.connect(actor).allowance(actor.address, owner.address)
    // const balance = await ironContract.transferFrom(actor.address, owner.address, hre.ethers.utils.parseEther("100"))
    // const balance1 = await ironContract.balanceOf(actor.address)
    // console.log(balance, balance1)
    // const goldContract = await hre.ethers.getContractAt('GOLD', goldAddress)
    // const balance2 = await goldContract.balanceOf(ownerAddress)
    // const balance3 = await goldContract.balanceOf('0x0FA7AC60db6596d0cD1e6D49C6FCe5f05f0F9B39')
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
  fastify.post('/contract/interactToken', async (request, reply) => {
    await contractInteractToken(request, reply)
  })
  fastify.post('/contract/interact', async (request, reply) => {
    await contractInteractLogic(request, reply)
  })
}

module.exports = dex
