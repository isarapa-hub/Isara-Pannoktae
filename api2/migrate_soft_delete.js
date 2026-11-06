const pool = require('./db');

async function migrate() {
  try {
    for (const tbl of ['attractions', 'restaurants', 'accommodations']) {
      const [cols] = await pool.query(
        'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [tbl, 'is_deleted']
      );
      if (cols.length === 0) {
        console.log(`Adding is_deleted to ${tbl}...`);
        await pool.query(`ALTER TABLE ${tbl} ADD COLUMN is_deleted TINYINT(1) DEFAULT 0`);
        console.log(`Added is_deleted to ${tbl} successfully.`);
      } else {
        console.log(`is_deleted already exists on ${tbl}.`);
      }
    }
    console.log('Soft delete migration finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
