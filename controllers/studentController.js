const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');

exports.addStudent = async (req, res) => {
    const { name, email, phone, registrationNumber } = req.body;
    console.log('Adding student for user:', req.user);
    try {
        const newStudent = await Student.create({
            name, email, phone, registrationNumber,
            createdById: req.user.id
        });
        // Create empty marks record
        await Mark.create({ studentId: newStudent.id });
        console.log('Student added:', newStudent.name);
        res.json(newStudent);
    } catch (err) {
        console.error('Add Student Error:', err);
        if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ msg: err.errors[0].message });
        }
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            where: { createdById: req.user.id },
            include: [Mark, Attendance]
        });
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateStudent = async (req, res) => {
    const { name, email, phone, registrationNumber } = req.body;
    const { id } = req.params;
    try {
        let student = await Student.findOne({ where: { id, createdById: req.user.id } });
        if (!student) return res.status(404).json({ msg: 'Student not found' });
        student = await student.update({ name, email, phone, registrationNumber });
        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const student = await Student.findOne({ where: { id, createdById: req.user.id } });
        if (!student) return res.status(404).json({ msg: 'Student not found' });

        // Delete related marks and attendance first
        await Mark.destroy({ where: { studentId: id } });
        await Attendance.destroy({ where: { studentId: id } });
        await student.destroy();

        res.json({ msg: 'Student removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Marks Controllers
exports.updateMarks = async (req, res) => {
    const { studentId, tamil, english, maths, science, social } = req.body;
    try {
        const total = parseInt(tamil) + parseInt(english) + parseInt(maths) + parseInt(science) + parseInt(social);
        const percentage = (total / 500) * 100;

        let marks = await Mark.findOne({ where: { studentId } });
        if (marks) {
            marks = await marks.update({ tamil, english, maths, science, social, total, percentage });
        } else {
            marks = await Mark.create({ studentId, tamil, english, maths, science, social, total, percentage });
        }
        res.json(marks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Attendance Controllers
exports.markAttendance = async (req, res) => {
    const { studentId, status, date } = req.body;
    try {
        const attendance = await Attendance.create({ studentId, status, date });
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
