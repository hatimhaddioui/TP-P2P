const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => res.send('Accueil'));
app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded: ' + req.file.path);
});

app.listen(8888, () => {
  console.log("Serveur Express démarré sur le port 8888");
});
