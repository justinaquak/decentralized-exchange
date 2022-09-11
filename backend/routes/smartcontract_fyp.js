const hre = require('hardhat')

async function contractCreateLogic(req, res) {

  const preResponse = async () => {
    const contract = await hre.ethers.getContractFactory("test")
    const dep = await contract.deploy()
    await dep.deployed();
  }

  try {
    await preResponse()
    res
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
  } catch (err) {
    res
      .code(400)
      .send(err)
  }
}

async function contractInteractLogic(req, res) {

  const preResponse = async () => {
    const dep = await hre.ethers.getContractAt("test", "0x2294Ef7d7e4B5bD8116781F50c6b8b5288B9f065")
    const that = await dep.getBalance()
    const these = await dep.getOwner()
    console.log(that)
    console.log(these)
  }

  try {
    await preResponse()
    res
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
  } catch (err) {
    res
      .code(400)
      .send(err)
  }
}

async function fyp_smartcontract(fastify, options) {
  fastify.post('/contract/create', async (request, reply) => {
    await contractCreateLogic(request, reply)
  })
  fastify.post('/contract/interact', async (request, reply) => {
    await contractInteractLogic(request, reply)
  })
  fastify.post('/test', async (request, reply) => {
    reply
      .code(200)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ response: 'This works' })
  })
}

module.exports = fyp_smartcontract