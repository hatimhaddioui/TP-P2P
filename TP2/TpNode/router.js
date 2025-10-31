function route(handle, pathname, response) {
    console.log("About to route a request for " + pathname);
    if (typeof handle[pathname] === 'function') {
        handle[pathname](response);
    } else {
        console.log("No request handler found for " + pathname);
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404: Resource not found");
        response.end();
    }
}
app.get('/show', (req, res) => {
    const fs = require('fs');
    const path = require('path');

    // On prend le dernier fichier uploadé
    const uploadsDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err || files.length === 0) return res.send("Aucun fichier trouvé.");
        const lastFile = files[files.length - 1];
        res.sendFile(path.join(uploadsDir, lastFile));
    });
});

exports.route = route;
