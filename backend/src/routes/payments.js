const router = require('express').Router();
router.get('/test', (req, res) => res.json({ message: 'Payments routes working' }));
module.exports = router;