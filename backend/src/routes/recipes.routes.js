const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: 'Recipes routes OK' });
});

module.exports = router;