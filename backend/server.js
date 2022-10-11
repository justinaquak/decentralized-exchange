const fastify = require('fastify')({ logger: true })

// Routes
const fypSmartContract = require('./routes/smartcontract_fyp')
const cz4153 = require('./routes/cz4153')

fastify.register(require("@fastify/cors"), {
  origin: "*",
  methods: ["GET", "POST"]
});
fastify.register(fypSmartContract, { prefix: '/fyp' })
fastify.register(cz4153, { prefix: '/cz4153' })

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 5000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()