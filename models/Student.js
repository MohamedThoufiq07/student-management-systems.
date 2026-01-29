const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Student = sequelize.define('Student', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    registrationNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    createdById: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
});

// Define Relationships
User.hasMany(Student, { foreignKey: 'createdById' });
Student.belongsTo(User, { foreignKey: 'createdById' });

module.exports = Student;

