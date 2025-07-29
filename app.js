const express = require('express');
const app = express();
const librosRouter = require('./routes/libros');

app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));

app.use((req, res, next) => {
 req.setTimeout(30 * 60 * 1000);
 res.setTimeout(30 * 60 * 1000);
 next();
});

app.use('/libros', librosRouter);
app.use(express.static('public'));

app.get('/', (req, res) => {
 res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`Servidor corriendo en http://localhost:${PORT}`);
});