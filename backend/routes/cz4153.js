const hre = require('hardhat')
const interact = require('./interact')

async function contractCreateLogic(req, res) {
  const preResponse = async () => {
    const contract = await hre.ethers.getContractFactory('Dex')
    const awaitDeploy = await contract.deploy()
    await awaitDeploy.deployed()
    return awaitDeploy.address
  }

  try {
    const contractAddress = await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ address: contractAddress })
  } catch (err) {
    res.code(400).send(err)
  }
}

async function contractInteractLogic(req, res) {
  const preResponse = async () => {
    const myContract = await hre.ethers.getContractAt('Dex', '0xDAbFe433403C27bF2CD02f4F6b0e8703D5A220e8')

    const name = await myContract.getName()
    const symbol = await myContract.getSymbol()
    const supply = await myContract.getTotalSupply()
    const balance = await myContract.balance('0xF28F80606a22149fd3f123efd7A18c6fbA32bE45')
    const buyer = await hre.ethers.getSigner('0x0FA7AC60db6596d0cD1e6D49C6FCe5f05f0F9B39')

    const buy = await myContract.connect(test).buy({value: 1e9})
    console.log(buy)
  }

  try {
    await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8')
  } catch (err) {
    res.code(400).send(err)
  }
}

async function contractCreateToken(req, res) {
  const preResponse = async () => {
    const contract = await hre.ethers.getContractFactory('Token')
    const awaitDeploy = await contract.deploy("Test1", "TNTLOL1")
    await awaitDeploy.deployed()
    return awaitDeploy.address
  }

  try {
    const contractAddress = await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ address: contractAddress })
  } catch (err) {
    res.code(400).send(err)
  }
}

async function fyp_smartcontract(fastify, options) {
  fastify.post('/contract/create', async (request, reply) => {
    await contractCreateLogic(request, reply)
  })
  fastify.post('/contract/interact', async (request, reply) => {
    await contractInteractLogic(request, reply)
  })
  fastify.post('/contract/token', async (request, reply) => {
    await contractCreateToken(request, reply)
  })
}

module.exports = fyp_smartcontract
