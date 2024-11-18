import express from 'express';
import cors from 'cors';
import path from 'path';
import { Mueller } from './routes/mueller.js';
import { RoundRock } from './routes/roundrock.js';
import { Pflugerville } from './routes/pflugerville.js';
import { ComingSoon } from './routes/comingsoon.js';

const app = express();
app.use(cors()); // Enables CORS for all routes

// Serve static files from the 'public' directory (adjust if your images are elsewhere)
app.use('/assets', express.static(path.join(process.cwd(), 'src/assets')));

app.get('/Mueller', (req, res) => {
    res.json(Mueller);
});

app.get('/Roundrock', (req, res) => {
    res.json(RoundRock);
});

app.get('/Pflugerville', (req, res) => {
    res.json(Pflugerville);
});

app.get('/comingsoon', (req,res) => {
    res.json(ComingSoon);
})

app.listen(3000, () => {
    console.log('Server Running on port 3000');
});
