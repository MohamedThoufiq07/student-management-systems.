const { sequelize } = require('./config/db');
const Student = require('./models/Student');
const Mark = require('./models/Mark');

const fix = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB...');

        // Sync first to create the new columns (firstName, lastName, etc.)
        await sequelize.sync({ alter: true });
        console.log('Database Synced (Altered).');

        // Check if 'name' column exists and migrate to firstName
        const [tableInfo] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Students'");
        const columns = tableInfo.map(c => c.column_name);

        if (columns.includes('name')) {
            console.log('Migrating name to firstName/lastName...');
            const [students] = await sequelize.query("SELECT id, name FROM \"Students\" WHERE \"firstName\" IS NULL");
            for (let s of students) {
                if (s.name) {
                    const parts = s.name.split(' ');
                    const first = parts[0];
                    const last = parts.slice(1).join(' ') || 'Student';
                    await sequelize.query(`UPDATE "Students" SET "firstName" = :first, "lastName" = :last WHERE id = :id`, {
                        replacements: { first, last, id: s.id }
                    });
                }
            }
        }

        // Final pass for any remaining nulls
        await sequelize.query(`UPDATE "Students" SET "firstName" = 'Unknown' WHERE "firstName" IS NULL`);
        await sequelize.query(`UPDATE "Students" SET "lastName" = 'Student' WHERE "lastName" IS NULL`);
        await sequelize.query(`UPDATE "Students" SET "email" = 'unknown' || id || '@example.com' WHERE "email" IS NULL`);
        await sequelize.query(`UPDATE "Students" SET "registrationNumber" = 'REG' || id WHERE "registrationNumber" IS NULL`);

        // Clean duplicates for the new unique fields
        const fields = ['email', 'phone', 'registrationNumber'];
        for (let field of fields) {
            const [dupes] = await sequelize.query(`SELECT "${field}", COUNT(*) FROM "Students" WHERE "${field}" IS NOT NULL AND "${field}" != '' GROUP BY "${field}" HAVING COUNT(*) > 1`);
            console.log(`Duplicate ${field} found:`, dupes);
            for (let res of dupes) {
                const students = await Student.findAll({ where: { [field]: res[field] }, order: [['id', 'ASC']] });
                const toDelete = students.slice(1);
                for (let s of toDelete) {
                    await Mark.destroy({ where: { studentId: s.id } });
                    await s.destroy();
                }
            }
        }

        // Clean firstName + lastName duplicates
        const [nameDupes] = await sequelize.query(`SELECT "firstName", "lastName", COUNT(*) FROM "Students" GROUP BY "firstName", "lastName" HAVING COUNT(*) > 1`);
        console.log('Duplicate name combinations found:', nameDupes);
        for (let res of nameDupes) {
            const students = await Student.findAll({ where: { firstName: res.firstName, lastName: res.lastName }, order: [['id', 'ASC']] });
            const toDelete = students.slice(1);
            for (let s of toDelete) {
                await Mark.destroy({ where: { studentId: s.id } });
                await s.destroy();
            }
        }

        console.log('Migration and cleaning complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fix();
