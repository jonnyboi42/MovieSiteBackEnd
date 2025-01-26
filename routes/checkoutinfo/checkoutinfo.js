import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Create a pool instance to connect to the PostgreSQL database
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Save checkout information
router.post('/saveCheckout', async (req, res) => {
  const {
    name,
    credit_card,
    billing_address,
    state,
    zip,
    email,
    movie,
    tickets,
    location,
    price
  } = req.body;

  // Validate input
  if (
    !name ||
    !credit_card ||
    !billing_address ||
    !state ||
    !zip ||
    !email ||
    !movie ||
    !tickets || 
    !location ||
    !price 
  ) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (credit_card.length !== 16 || isNaN(credit_card)) {
    return res
      .status(400)
      .json({ error: 'Credit card number must be 16 digits.' });
  }

  try {
    // Insert checkout information into the database
    const query = `
      INSERT INTO checkout_info 
      (name, credit_card, billing_address, state, zip, email, movie, tickets, location, price) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`;
      const values = [
        name, credit_card, billing_address, state, zip, email, 
        movie, tickets, location, price
      ];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Checkout information saved successfully.',
      checkoutId: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error saving checkout info:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get all checkout information (for admin or debugging purposes)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM checkout_info');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching checkout info:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get checkout information by email
router.get('/email/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const query = 'SELECT * FROM checkout_info WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No checkout records found for this email.' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching checkout info by email:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
