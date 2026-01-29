const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Student = require('./Student');

const Attendance = sequelize.define('Attendance', {
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.STRING, defaultValue: 'Present' }, // Present/Absent
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Student, key: 'id' }
    }
});

Student.hasMany(Attendance, { foreignKey: 'studentId' });
Attendance.belongsTo(Student, { foreignKey: 'studentId' });

module.exports = Attendance;
