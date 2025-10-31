const http = require("http");
const url = require("url");

function start(route, handle) {
    const server = http.createServer((req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, file-name, user-login");

        if (req.method === "OPTIONS") {
            res.writeHead(200);
            res.end();
            return;
        }

        const pathname = url.parse(req.url).pathname;
        console.log("Request received:", pathname);
        route(handle, pathname, req, res);
    });

    server.listen(8888, () => console.log("🚀 Server running at http://localhost:8888/"));
}

exports.start = start;
