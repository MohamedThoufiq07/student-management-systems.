const express = require('express');
const router = express.Router();
const { addStudent, getStudents, updateStudent, deleteStudent, updateMarks, markAttendance } = require('../controllers/studentController');
const auth = require('../middleware/auth');

router.post('/', auth, addStudent);
router.get('/', auth, getStudents);
router.put('/:id', auth, updateStudent);
router.delete('/:id', auth, deleteStudent);

// New Routes
router.post('/marks', auth, updateMarks);
router.post('/attendance', auth, markAttendance);

module.exports = router;
