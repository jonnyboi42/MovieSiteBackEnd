import express from 'express';
import cors from 'cors';
import path from 'path';

//Necessary Imports for Movie Data
import { Mueller } from './routes/nowplaying/mueller.js';
import { RoundRock } from './routes/nowplaying/roundrock.js';
import { ComingSoon } from './routes/comingsoon/comingsoon.js';
import { ComingSoonRoundRock } from './routes/comingsoon/comingsoonroundrock.js'
import { ComingSoonMueller} from './routes/comingsoon/comingsoonmueller.js'

// Imports for Redeeming Vouchers & Checkinng out / Purchasing Tickets
import vouchersRoutes from './routes/vouchers/vouchers.js'
import checkoutRoutes from './routes/checkoutinfo/checkoutinfo.js'


const app = express();
//app.use(cors()); // Enables CORS for all routes

app.use(cors({
    origin: 'https://moviesitefrontend.onrender.com', // Allow requests from your front-end URL
    methods: 'GET, POST, PUT, DELETE', // Allow all common HTTP methods
    allowedHeaders: 'Content-Type, Authorization', // Allow necessary headers
    credentials: true, // If you are sending cookies or authentication tokens
}));

// Use express.json() middleware to parse JSON bodies
app.use(express.json());  // Add this line

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

app.get('/comingsoonroundrock', (req,res) => {
    res.json(ComingSoonRoundRock);
});

app.get('/comingsoonmueller', (req,res) => {
    res.json(ComingSoonMueller);
});



// Map locations to their respective datasets
const locations = {
    mueller: Mueller,
    roundrock: RoundRock
};

app.get('/:category/:location/movie/:id', (req, res) => {
    const { category, location, id } = req.params;

    if (category.toLowerCase() === 'comingsoon') {
        // Handle comingsoon category
        if (location.toLowerCase() === 'roundrock') {
            const movie = ComingSoonRoundRock.find((m) => m.id === parseInt(id));
            if (!movie) {
                return res.status(404).json({ error: `Movie with ID '${id}' not found in 'Coming Soon' at RoundRock.` });
            }
            return res.json(movie);
        }
        if (location.toLowerCase() === 'mueller') {
            const movie = ComingSoonMueller.find((m) => m.id === parseInt(id));
            if (!movie) {
                return res.status(404).json({ error: `Movie with ID '${id}' not found in 'Coming Soon' at Mueller.` });
            }
            return res.json(movie);
        }
        return res.status(404).json({ error: `Location '${location}' not found for 'Coming Soon' movies.` });
    }

    if (category.toLowerCase() === 'playingsoon') {
        // Handle playingsoon category
        if (location.toLowerCase() === 'roundrock') {
            const movie = RoundRock.find((m) => m.id === parseInt(id));
            if (!movie) {
                return res.status(404).json({ error: `Movie with ID '${id}' not found in 'Playing Soon' at RoundRock.` });
            }
            return res.json(movie);
        }
        if (location.toLowerCase() === 'mueller') {
            const movie = Mueller.find((m) => m.id === parseInt(id));
            if (!movie) {
                return res.status(404).json({ error: `Movie with ID '${id}' not found in 'Playing Soon' at Mueller.` });
            }
            return res.json(movie);
        }
        return res.status(404).json({ error: `Location '${location}' not found for 'Playing Soon' movies.` });
    }

    // If neither comingsoon nor playingsoon
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


// Mount the vouchers route under /api/vouchers
app.use('/api/vouchers', vouchersRoutes);

// Mount the vouchers route under /api/vouchers
app.use('/api/checkoutinfo', checkoutRoutes);

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
