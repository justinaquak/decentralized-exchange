const hre = require('hardhat')

async function contractCreateToken(req, res) {
  const preResponse = async () => {
    const gold = await hre.ethers.getContractFactory('GOLD')
    const deployGold = await gold.deploy()
    await deployGold.deployed()
    const silver = await hre.ethers.getContractFactory('SILVER')
    const deploySilver = await silver.deploy()
    await deploySilver.deployed()
    const bronze = await hre.ethers.getContractFactory('BRONZE')
    const deployBronze = await bronze.deploy()
    await deployBronze.deployed()
    return [ deployGold.address, deploySilver.address, deployBronze.address ]
  }

  try {
    const contractAddress = await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ address: contractAddress })
  } catch (err) {
    res.code(400).send(err)
  }
}

async function contractCreateLogic(req, res) {
  const preResponse = async () => {
    const contract = await hre.ethers.getContractFactory('Dex')
    const deployContract = await contract.deploy()
    await deployContract.deployed()
    return deployContract.address
  }

  try {
    const contractAddress = await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ address: contractAddress })
  } catch (err) {
    res.code(400).send(err)
  }
}

async function create(fastify, options) {
  fastify.post('/token', async (request, reply) => {
    await contractCreateToken(request, reply)
  })
  fastify.post('/contract', async (request, reply) => {
    await contractCreateLogic(request, reply)
  })
}

module.exports = create
