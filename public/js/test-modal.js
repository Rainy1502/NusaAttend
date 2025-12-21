// Test script untuk verifikasi modal manajemen-karyawan
// Jalankan di browser console saat di halaman /admin/karyawan

console.log('=== MODAL MANAJEMEN KARYAWAN - TEST ===');

// Test 1: Check apakah semua elemen ada
const button = document.getElementById('tombolBukaModalKaryawan');
const modal = document.getElementById('lapisanOverlayTambahKaryawan');
const form = document.getElementById('formTambahKaryawan');

console.log('Test 1 - DOM Elements:');
console.log('  ✓ Button:', !!button);
console.log('  ✓ Modal:', !!modal);
console.log('  ✓ Form:', !!form);

// Test 2: Check apakah function ada
console.log('\nTest 2 - Functions:');
console.log('  ✓ bukaModalTambahKaryawan:', typeof bukaModalTambahKaryawan);
console.log('  ✓ tutupModalTambahKaryawan:', typeof tutupModalTambahKaryawan);

// Test 3: Simulasi button click
if (button) {
    console.log('\nTest 3 - Simulating button click...');
    button.click();
    
    // Check apakah modal visible
    setTimeout(() => {
        const isVisible = modal.classList.contains('tampil-overlay');
        console.log('  ✓ Modal visible:', isVisible);
        if (isVisible) {
            console.log('✅ MODAL WORKS CORRECTLY!');
        } else {
            console.log('❌ Modal did not show');
        }
    }, 100);
}
