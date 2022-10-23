const hre = require('hardhat')
const {contractAddress, goldAddress, silverAddress, bronzeAddress} = require('../constants.js')
const AMOUNT = 10000

async function addressTransferLogic(req, res) {
    const [owner, actor, third] = await hre.ethers.getSigners()
  
    const transferGold = async () => {
      const goldContract = await hre.ethers.getContractAt('GOLD', goldAddress)
  
      const transfer = await goldContract.transfer(actor.address, AMOUNT)
      await transfer.wait()
    }
  
    const transferSilver = async () => {
      const silverContract = await hre.ethers.getContractAt('SILVER', silverAddress)
  
      const transfer = await silverContract.transfer(actor.address, AMOUNT)
      await transfer.wait()
    }
  
    const transferBronze = async () => {
      const bronzeContract = await hre.ethers.getContractAt('BRONZE', bronzeAddress)
  
      const transfer = await bronzeContract.transfer(actor.address, AMOUNT)
      await transfer.wait()
    }
  
    try {
      await transferGold();
      await transferSilver();
      await transferBronze();
      res.code(200).header('Content-Type', 'application/json; charset=utf-8')
    } catch (err) {
      res.code(400).send(err)
    }
  }

async function contractTransferLogic(req, res) {
  const transferGold = async () => {
    const goldContract = await hre.ethers.getContractAt('GOLD', goldAddress)

    const transfer = await goldContract.transfer(contractAddress, AMOUNT)
    await transfer.wait()
  }

  const transferSilver = async () => {
    const silverContract = await hre.ethers.getContractAt('SILVER', silverAddress)

    const transfer = await silverContract.transfer(contractAddress, AMOUNT)
    await transfer.wait()
  }

  const transferBronze = async () => {
    const bronzeContract = await hre.ethers.getContractAt('BRONZE', bronzeAddress)

    const transfer = await bronzeContract.transfer(contractAddress, AMOUNT)
    await transfer.wait()
  }

  try {
    await transferGold();
    await transferSilver();
    await transferBronze();
    res.code(200).header('Content-Type', 'application/json; charset=utf-8')
  } catch (err) {
    res.code(400).send(err)
  }
}

async function transfer(fastify, options) {
    fastify.post('/contract', async (request, reply) => {
      await contractTransferLogic(request, reply)
    })
    fastify.post('/address', async (request, reply) => {
      await addressTransferLogic(request, reply)
    })
  }
  
  module.exports = transfer
