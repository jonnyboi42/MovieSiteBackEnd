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

// Get all vouchers (optional, if you need this route)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vouchers');
    res.json(result.rows);
  } catch (error) {
    console.error("Error checking voucher:", error.message);
    console.log('Error Fetching Vouchers Database:', error);
    res.status(500).send('Error retrieving vouchers');
  }
});

// Check voucher validity (post route for voucher code)
router.post('/checkVoucher', async (req, res) => {
  const { voucherCode } = req.body;

  try {
    // Query the database to check if the voucher exists
    const result = await pool.query('SELECT * FROM vouchers WHERE voucher_code = $1', [voucherCode]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    const voucher = result.rows[0];
    const currentDate = new Date();

    // Check if voucher is already redeemed
    if (voucher.redeemed) {
      return res.status(400).json({ error: "Voucher already redeemed" });
    }

    // Check if voucher is expired
    if (new Date(voucher.expiration_date) < currentDate) {
      return res.status(400).json({ error: "Voucher expired" });
    }

    // If voucher is valid, mark it as redeemed
    await pool.query('UPDATE vouchers SET redeemed = $1 WHERE voucher_code = $2', [true, voucherCode]);

    return res.status(200).json({ discount: voucher.amount });
  } catch (error) {
    console.error("Error checking voucher:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
