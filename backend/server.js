const fastify = require("fastify")({ logger: true });

// Routes
const dex = require("./routes/dex");

fastify.register(require("@fastify/cors"), {
  origin: "*",
  methods: ["GET", "POST"],
});
fastify.register(dex, { prefix: "/dex" });

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 5000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
