var exec = require("child_process").exec;

function start(response) {
  console.log("Request handler 'start' was called.");
  
  setTimeout(function() {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello start (completed after 1s)");
    response.end();
  }, 1000); 
}

function find(response) {
  console.log("Request handler 'find' was called.");
 
  var cmd = process.platform === 'win32' ? 'dir' : 'ls -la';
  exec(cmd, { timeout: 10000, maxBuffer: 200 * 1024 }, function (error, stdout, stderr) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    if (error) {
      response.write("Error executing find-like command: " + error.message + "\n");
    }
    response.write(stdout || stderr);
    response.end();
  });
}

function upload(response) {
  console.log("Request handler 'upload' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello Upload");
  response.end();
}

function show(response) {
  console.log("Request handler 'show' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello show");
  response.end();
}

function login(response) {
  console.log("Request handler 'login' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello login");
  response.end();
}

function logout(response) {
  console.log("Request handler 'logout' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello logout");
  response.end();
}

exports.start = start;
exports.upload = upload;
exports.find = find;
exports.show = show;
exports.login = login;
exports.logout = logout;
