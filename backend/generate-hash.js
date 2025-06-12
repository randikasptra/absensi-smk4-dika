const bcrypt = require('bcrypt');

async function generateHash() {
  // Password yang ingin di-hash
  const password = 'dika123'; // Ganti dengan password yang Anda inginkan
  
  // Generate salt dan hash
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  console.log('Password:', password);
  console.log('Hash:', hashedPassword);
  
  // Tambahan: Query SQL untuk update password admin
  console.log('\nSQL Query untuk update password:');
  console.log(`UPDATE users SET password = '${hashedPassword}' WHERE username = 'dika';`);
}

generateHash();