const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { addComment, getComments } = require('../controllers/commentsController');

router.post('/', authenticate, addComment);
router.get('/:report_id', authenticate, getComments);

module.exports = router;