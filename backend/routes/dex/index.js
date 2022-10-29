const create = require("./create");
const getter = require("./getter");
const orders = require("./orders");
const transfer = require("./transfer");
const remove = require("./remove");

async function dex(fastify, options) {
  fastify.register(create, { prefix: "/create" });
  fastify.register(getter, { prefix: "/get" });
  fastify.register(orders, { prefix: "/orders" });
  fastify.register(transfer, { prefix: "/transfer" });
  fastify.register(remove, { prefix: "/remove" });
}

module.exports = dex;
