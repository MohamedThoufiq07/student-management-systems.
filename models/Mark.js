const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Student = require('./Student');

const Mark = sequelize.define('Mark', {
    tamil: { type: DataTypes.INTEGER, defaultValue: 0 },
    english: { type: DataTypes.INTEGER, defaultValue: 0 },
    maths: { type: DataTypes.INTEGER, defaultValue: 0 },
    science: { type: DataTypes.INTEGER, defaultValue: 0 },
    social: { type: DataTypes.INTEGER, defaultValue: 0 },
    total: { type: DataTypes.INTEGER, defaultValue: 0 },
    percentage: { type: DataTypes.FLOAT, defaultValue: 0 },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Student, key: 'id' }
    }
});

Student.hasOne(Mark, { foreignKey: 'studentId' });
Mark.belongsTo(Student, { foreignKey: 'studentId' });

module.exports = Mark;
