const router = require('express').Router();
router.get('/test', (req, res) => res.json({ message: 'Programs routes working' }));
module.exports = router;