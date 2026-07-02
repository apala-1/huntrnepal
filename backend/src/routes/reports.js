const router = require('express').Router();
const { 
  getAllPrograms, getProgram, 
  createProgram, updateProgram, getMyPrograms 
} = require('../controllers/programsController');
const { authenticate, authorize } = require('../middleware/auth');

// Public
router.get('/', getAllPrograms);
router.get('/:id', getProgram);

// Company only
router.post('/', authenticate, authorize('company'), createProgram);
router.put('/:id', authenticate, authorize('company'), updateProgram);
router.get('/company/mine', authenticate, authorize('company'), getMyPrograms);

module.exports = router;