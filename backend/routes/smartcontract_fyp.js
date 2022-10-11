const hre = require('hardhat')

async function contractCreateLogic(req, res) {
  const preResponse = async () => {
    const contract = await hre.ethers.getContractFactory('dex')
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

async function contractInteractLogic(req, res) {}

async function fyp_smartcontract(fastify, options) {
  fastify.post('/contract/create', async (request, reply) => {
    await contractCreateLogic(request, reply)
  })
  fastify.post('/contract/interact', async (request, reply) => {
    await contractInteractLogic(request, reply)
  })
}

module.exports = fyp_smartcontract