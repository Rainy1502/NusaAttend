const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import User model
const User = require('../src/models/User');

/**
 * Script untuk update semua user dengan role 'supervisor' menjadi 'penanggung-jawab'
 * 
 * Jalankan dengan: node database/updateRoleSuperviso rToPenanggungJawab.js
 */

async function updateRoles() {
  try {
    // Hubungkan ke MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nusaattend', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✓ Terhubung ke MongoDB');

    // Update semua user dengan role 'supervisor' menjadi 'penanggung-jawab'
    const result = await User.updateMany(
      { role: 'supervisor' },
      { role: 'penanggung-jawab' }
    );

    console.log(`\n✓ Update Role Berhasil!`);
    console.log(`  - Total documents matched: ${result.matchedCount}`);
    console.log(`  - Total documents modified: ${result.modifiedCount}`);

    // Verifikasi hasil
    const countPenanggungJawab = await User.countDocuments({ role: 'penanggung-jawab' });
    const countSupervisor = await User.countDocuments({ role: 'supervisor' });

    console.log(`\n✓ Verifikasi:`);
    console.log(`  - Users dengan role 'penanggung-jawab': ${countPenanggungJawab}`);
    console.log(`  - Users dengan role 'supervisor': ${countSupervisor}`);

    // Disconnect
    await mongoose.disconnect();
    console.log(`\n✓ Disconnect dari MongoDB`);

  } catch (error) {
    console.error('✗ Error saat update role:', error);
    process.exit(1);
  }
}

updateRoles();
