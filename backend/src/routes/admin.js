const router = require('express').Router();
router.get('/test', (req, res) => res.json({ message: 'Admin routes working' }));
module.exports = router;