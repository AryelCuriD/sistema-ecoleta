const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'src')));

app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});