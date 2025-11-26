const express = require('express');
const router = express.Router();

// Routes à venir
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes OK' });
});

module.exports = router;