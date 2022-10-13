const hre = require('hardhat')
// const interact = require('./interact')

async function contractCreateLogic(req, res) {
  const preResponse = async () => {
    const contract = await hre.ethers.getContractFactory('Dex')
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

async function contractInteractLogic(req, res) {
  const preResponse = async () => {
    // const myContract = await hre.ethers.getContractAt('Dex', '0x2aEaFB7d02bE94539F1c2471B064Bbdf5C0B1B86')
    // const buyer = await hre.ethers.getSigner('0x299127084517507488613Ca5CC0A22F6230495E7')
    // const buy = await myContract.connect(buyer).buy({value: 1e9})
    // console.log(buy)
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
    const gold = await hre.ethers.getContractFactory('GOLD')
    const silver = await hre.ethers.getContractFactory('SILVER')
    const bronze = await hre.ethers.getContractFactory('BRONZE')
    const deployGold = await gold.deploy()
    const deploySilver = await silver.deploy()
    const deployBronze = await bronze.deploy()
    await deployGold.deployed()
    await deploySilver.deployed()
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
