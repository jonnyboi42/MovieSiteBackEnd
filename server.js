import express from 'express';
import cors from 'cors';
import path from 'path';
import { Mueller } from './routes/nowplaying/mueller.js';
import { RoundRock } from './routes/nowplaying/roundrock.js';
import { ComingSoon } from './routes/comingsoon/comingsoon.js';

//Hello there
const app = express();
app.use(cors()); // Enables CORS for all routes

// Serve static files from the 'public' directory (adjust if your images are elsewhere)
app.use('/assets', express.static(path.join(process.cwd(), 'src/assets')));

// Location-specific endpoints
app.get('/Mueller', (req, res) => {
    res.json(Mueller);
});

app.get('/Roundrock', (req, res) => {
    res.json(RoundRock);
});

app.get('/comingsoon', (req, res) => {
    res.json(ComingSoon);
});

// Map locations to their respective datasets
const locations = {
    mueller: Mueller,
    roundrock: RoundRock
};

// Dynamic route to fetch a specific movie by location and ID
app.get('/:location/movie/:id', (req, res) => {
    const { location, id } = req.params;

    if (location.toLowerCase() === 'comingsoon') {
        const movie = ComingSoon.find((m) => m.id === parseInt(id));
        if (!movie) {
            return res.status(404).json({ error: `Movie with ID '${id}' not found in 'Coming Soon'.` });
        }
        return res.json(movie);
    }

    const movies = locations[location.toLowerCase()];
    if (!movies) {
        return res.status(404).json({ error: `Location '${location}' not found.` });
    }

    const movie = movies.find((m) => m.id === parseInt(id));
    if (!movie) {
        return res.status(404).json({ error: `Movie with ID '${id}' not found in '${location}'.` });
    }

    res.json(movie);
});



// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
