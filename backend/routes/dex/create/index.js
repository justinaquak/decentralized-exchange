const hre = require('hardhat')

async function contractCreateToken(req, res) {
  const preResponse = async () => {
    const iron = await hre.ethers.getContractFactory('IRON')
    const gold = await hre.ethers.getContractFactory('GOLD')
    const silver = await hre.ethers.getContractFactory('SILVER')
    const bronze = await hre.ethers.getContractFactory('BRONZE')
    const deployIron = await iron.deploy()
    const deployGold = await gold.deploy()
    const deploySilver = await silver.deploy()
    const deployBronze = await bronze.deploy()
    await deployIron.deployed()
    await deployGold.deployed()
    await deploySilver.deployed()
    await deployBronze.deployed()
    return [ deployIron.address, deployGold.address, deploySilver.address, deployBronze.address ]
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
  fastify.post('/token/create', async (request, reply) => {
    await contractCreateToken(request, reply)
  })
  fastify.post('/create', async (request, reply) => {
    await contractCreateLogic(request, reply)
  })
}

module.exports = create
