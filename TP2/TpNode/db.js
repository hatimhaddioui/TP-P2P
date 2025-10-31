const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/tpnode', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Erreur de connexion MongoDB:'));
db.once('open', () => console.log('✅ MongoDB connecté'));

module.exports = db;
