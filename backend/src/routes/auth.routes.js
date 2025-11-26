const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes OK' });
});

module.exports = router;