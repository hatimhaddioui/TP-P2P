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
  "/debug-db": requestHandlers.debugDB  // ⬅️ AJOUTEZ CETTE LIGNE
};

function route(handle, pathname, req, res) {
    console.log("Routing request for:", pathname);
    if (typeof handle[pathname] === "function") {
        handle[pathname](req, res);
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Route not found" }));
    }
}

exports.route = route;
