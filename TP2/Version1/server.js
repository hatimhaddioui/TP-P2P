// server.js
var http = require("http");

http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}).listen(8888, function() {
  console.log("Server listening on http://localhost:8888/");
});
