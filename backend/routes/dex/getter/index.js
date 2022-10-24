const hre = require('hardhat')
const {contractAddress, goldAddress, silverAddress, bronzeAddress} = require('../constants.js')

async function getUser(user) {
  const [owner, actor, third] = await hre.ethers.getSigners()
  if (user == "owner") {
    return owner
  } else if (user == "actor") {
    return actor
  } else if (user == "third") {
    return third
  }
}

async function getUserAddress(user) {
  const [owner, actor, third] = await hre.ethers.getSigners()
  if (user == "owner") {
    return owner.address
  } else if (user == "actor") {
    return actor.address
  } else if (user == "third") {
    return third.address
  }
}

/*
[
  [ BigNumber { value: "100" }, BigNumber { value: "100" } ],
  [ BigNumber { value: "1" }, BigNumber { value: "1" } ]
] 

[
  [ BigNumber { value: "100" }, BigNumber { value: "0" } ],
  [ BigNumber { value: "2" }, BigNumber { value: "0" } ]
]
*/
function parseOrders(array) {
  if (array[0].length == 0) return []
  const pricesArr = array[0]
  const volumeArr = array[1]
  let newArr = []
  for (let i = 0; i < array.length; i++) {
    let data = {}
    if (pricesArr[i].toString() != "0") {
      data.price = pricesArr[i].toString()
      data.volume = volumeArr[i].toString()
      newArr.push(data)
    }
  }
  return newArr
}

function parseBalance(value) {
  value = value.toString()
  value = value.slice(0,-18)
  return value
}

async function getOrderBooks(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt('Dex', contractAddress)

    const goldBuyOrders = await dexContract.getBuyOrders(goldAddress);
    const goldSellOrders = await dexContract.getSellOrders(goldAddress);
    const silverBuyOrders = await dexContract.getBuyOrders(silverAddress);
    const silverSellOrders = await dexContract.getSellOrders(silverAddress);
    const bronzeBuyOrders = await dexContract.getBuyOrders(bronzeAddress);
    const bronzeSellOrders = await dexContract.getSellOrders(bronzeAddress);

    let gold = {}
    let silver = {}
    let bronze = {}
    gold.buyOrders = parseOrders(goldBuyOrders)
    gold.sellOrders = parseOrders(goldSellOrders)
    silver.buyOrders = parseOrders(silverBuyOrders)
    silver.sellOrders = parseOrders(silverSellOrders)
    bronze.buyOrders = parseOrders(bronzeBuyOrders)
    bronze.sellOrders = parseOrders(bronzeSellOrders)

    return [gold, silver, bronze]
  }

  try {
    const data = await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({gold: data[0], silver: data[1], bronze: data[2]})
  } catch (err) {
    res.code(400).send(err)
  }
}

async function getUserOrders(req, res) {
  const preResponse = async () => {
    const dexContract = await hre.ethers.getContractAt('Dex', contractAddress)
    const user = await getUser(req.query.user)

    const goldBuyOrders = await dexContract.connect(user).getUserBuyOrders(goldAddress);
    const goldSellOrders = await dexContract.connect(user).getUserSellOrders(goldAddress);
    const silverBuyOrders = await dexContract.connect(user).getUserBuyOrders(silverAddress);
    const silverSellOrders = await dexContract.connect(user).getUserSellOrders(silverAddress);
    const bronzeBuyOrders = await dexContract.connect(user).getUserBuyOrders(bronzeAddress);
    const bronzeSellOrders = await dexContract.connect(user).getUserSellOrders(bronzeAddress);

    let gold = {}
    let silver = {}
    let bronze = {}
    gold.buyOrders = parseOrders(goldBuyOrders)
    gold.sellOrders = parseOrders(goldSellOrders)
    silver.buyOrders = parseOrders(silverBuyOrders)
    silver.sellOrders = parseOrders(silverSellOrders)
    bronze.buyOrders = parseOrders(bronzeBuyOrders)
    bronze.sellOrders = parseOrders(bronzeSellOrders)

    return [gold, silver, bronze]
  }

  try {
    const data = await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({gold: data[0], silver: data[1], bronze: data[2]})
  } catch (err) {
    res.code(400).send(err)
  }
}

async function getUserBalance(req, res) {
  const preResponse = async () => {
    const userAddress = await getUserAddress(req.query.user)
    const goldContract = await hre.ethers.getContractAt('GOLD', goldAddress)
    const silverContract = await hre.ethers.getContractAt('SILVER', silverAddress)
    const bronzeContract = await hre.ethers.getContractAt('BRONZE', bronzeAddress)

    const goldBalance = await goldContract.balanceOf(userAddress)
    const silverBalance = await silverContract.balanceOf(userAddress)
    const bronzeBalance = await bronzeContract.balanceOf(userAddress)
    console.log(goldBalance)

    return [parseBalance(goldBalance), parseBalance(silverBalance), parseBalance(bronzeBalance)]
  }

  try {
    const data = await preResponse()
    res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({gold: data[0], silver: data[1], bronze: data[2]})
  } catch (err) {
    res.code(400).send(err)
  }
}

async function getter(fastify, options) {
  fastify.get('/orders', async (request, reply) => {
    await getOrderBooks(request, reply)
  })
  fastify.get('/userOrders', async (request, reply) => {
    await getUserOrders(request, reply)
  })
  fastify.get('/userBalance', async (request, reply) => {
    await getUserBalance(request, reply)
  })
}

module.exports = getter
