const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllPrograms, getProgram,
  createProgram, updateProgram, getMyPrograms
} = require('../controllers/programsController');

// Public
router.get('/', getAllPrograms);
router.get('/:id', getProgram);

// Company only
router.post('/', authenticate, authorize('company'), createProgram);
router.put('/:id', authenticate, authorize('company'), updateProgram);
router.get('/my/programs', authenticate, authorize('company'), getMyPrograms);

module.exports = router;