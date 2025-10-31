const server = require("./server");
const router = require("./router");
const requestHandlers = require("./requestHandlers");

const handle = {
  "/": requestHandlers.start,
  "/start": requestHandlers.start,
  "/register": requestHandlers.register,
  "/login": requestHandlers.login,
  "/upload": requestHandlers.upload,
  "/find": requestHandlers.find,
  "/show": requestHandlers.show,
  "/logout": requestHandlers.logout,
  "/debug-db": requestHandlers.debugDB
};

server.start(router.route, handle);
