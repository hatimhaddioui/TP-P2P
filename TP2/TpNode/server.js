const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');

require('./db'); // connexion MongoDB
const User = require('./models/User');

const app = express();
const upload = multer({ dest: 'uploads/' });

let currentUser = null;

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware d'authentification
function authMiddleware(req, res, next) {
    if (currentUser) next();
    else res.send('❌ Accès refusé. Veuillez vous <a href="/login">connecter</a>.');
}

// Page d'accueil
app.get('/', async (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadsDir, (err, files) => {
        let lastFileHtml = '';
        let filesListHtml = '';

        if (!err && files.length > 0) {
            const lastFile = files[files.length - 1];
            lastFileHtml = `<h2>Dernier fichier uploadé :</h2>
                            <img src="/uploads/${lastFile}" style="max-width:400px;"/><br>`;
            filesListHtml = `<h3>Tous les fichiers :</h3><ul>` + 
                files.map(f => `<li><a href="/uploads/${f}">${f}</a></li>`).join('') + 
                `</ul>`;
        }

        res.send(`
            <h1>Bienvenue ${currentUser ? currentUser.login : 'invité'}</h1>
            ${currentUser ? lastFileHtml + filesListHtml : '<p>Connectez-vous pour voir les fichiers.</p>'}
            
            ${currentUser ? `
            <form action="/upload" method="post" enctype="multipart/form-data">
                <input type="file" name="file"/>
                <button type="submit">Uploader</button>
            </form>
            <br>
            <a href="/logout"><button>Logout</button></a>
            ` : `
            <a href="/login"><button>Login</button></a>
            <a href="/register"><button>S'inscrire</button></a>
            `}
        `);
    });
});

// LOGIN
app.get('/login', (req, res) => {
    res.send(`
        <h1>Connexion</h1>
        <form action="/login" method="post">
            Login: <input type="text" name="login"/><br>
            Password: <input type="password" name="password"/><br>
            <button type="submit">Se connecter</button>
        </form>
    `);
});

app.post('/login', async (req, res) => {
    const { login, password } = req.body;
    const user = await User.findOne({ login, password });
    if (user) { 
        currentUser = user; 
        res.redirect('/'); 
    } else {
        res.send('❌ Login ou mot de passe incorrect. <a href="/login">Réessayer</a>');
    }
});

// REGISTER
app.get('/register', (req, res) => {
    res.send(`
        <h1>Inscription</h1>
        <form action="/register" method="post">
            Login: <input type="text" name="login"/><br>
            Password: <input type="password" name="password"/><br>
            <button type="submit">S\'inscrire</button>
        </form>
    `);
});

app.post('/register', async (req, res) => {
    const { login, password } = req.body;
    try {
        const existingUser = await User.findOne({ login });
        if (existingUser) {
            return res.send('❌ Login déjà existant. <a href="/register">Réessayer</a>');
        }
        const newUser = new User({ login, password });
        await newUser.save();
        res.send('✅ Compte créé ! <a href="/login">Connectez-vous</a>');
    } catch (err) {
        res.send('❌ Erreur lors de l\'inscription. <a href="/register">Réessayer</a>');
    }
});

// LOGOUT
app.get('/logout', (req, res) => { 
    currentUser = null; 
    res.redirect('/'); 
});

// UPLOAD
app.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) return res.send("Aucun fichier choisi.");
    currentUser.uploads.push(req.file.filename);
    currentUser.save().then(() => res.redirect('/'));
});

// Lancement du serveur
app.listen(8888, () => console.log('🚀 Serveur lancé sur http://localhost:8888'));
