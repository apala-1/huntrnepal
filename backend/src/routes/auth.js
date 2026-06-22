const router = require('express').Router();
router.get('/test', (req, res) => res.json({ message: 'Auth routes working' }));
module.exports = router;