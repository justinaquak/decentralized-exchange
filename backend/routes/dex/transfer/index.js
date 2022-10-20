const hre = require('hardhat')

const contractAddress = "0x4826533B4897376654Bb4d4AD88B7faFD0C98528"
const ironAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const goldAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const silverAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
const bronzeAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"

const AMOUNT = 10000

async function addressTransferLogic(req, res) {
    const [owner, actor] = await hre.ethers.getSigners()
    const transferIron = async () => {
      const ironContract = await hre.ethers.getContractAt('IRON', ironAddress)
  
      const transfer = await ironContract.transfer(actor.address, AMOUNT)
      await transfer.wait()
    }
  
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
      await transferIron();
      await transferGold();
      await transferSilver();
      await transferBronze();
      res.code(200).header('Content-Type', 'application/json; charset=utf-8')
    } catch (err) {
      res.code(400).send(err)
    }
  }

async function contractTransferLogic(req, res) {
  const transferIron = async () => {
    const ironContract = await hre.ethers.getContractAt('IRON', ironAddress)

    const transfer = await ironContract.transfer(contractAddress, AMOUNT)
    await transfer.wait()
  }

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
    await transferIron();
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
