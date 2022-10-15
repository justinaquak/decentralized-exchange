const hre = require('hardhat')
// const interact = require('./interact')

const contractAddress = '0xAAd2f2e899EE89a8A11027A3122Ba46E2EF350EA'
const ownerAddress = '0x299127084517507488613Ca5CC0A22F6230495E7'
const goldAddress = "0xa15916E98DA69A24c3FD2e9Da6b03bB8351D15f9"
const silverAddress = "0x3890448215221940163C75fd757Cc17DFD22b2CD"
const bronzeAddress = "0x74Af70ea185F201c6283d725473AaB2De7b6775c"

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

async function contractInteractLogic(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt('Dex', contractAddress)
    const owner = await hre.ethers.getSigner(ownerAddress)
    const feedback = await dexContract.connect(owner).buy()
    console.log(feedback)
    // const test = await feedback.wait()
    // console.log(test.events)
    return feedback
  }

  try {
    await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ feedback: events })
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

async function contractInteractToken(req, res) {
  const preResponse = async () => {
    const goldContract = await hre.ethers.getContractAt('GOLD', goldAddress)
    const owner = await hre.ethers.getSigner("0xdC950e7c5946d787b8eF7a34b14686f2498D7347")
    const feedback = await goldContract.connect(owner).transferFrom(goldAddress, "0xdC950e7c5946d787b8eF7a34b14686f2498D7347", 100000)
    console.log(feedback)
    // const test = await feedback.wait()
    // console.log(test.events)
    return feedback
  }

  try {
    await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ feedback: events })
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
  fastify.post('/contract/interactToken', async (request, reply) => {
    await contractInteractToken(request, reply)
  })
  fastify.post('/contract/fake', async (request, reply) => {
    await contractInteractToken(request, reply)
  })
}

module.exports = fyp_smartcontract
