// Simple form handler - FIXED VERSION
console.log("App.js loaded!");

// Tunggu sampai halaman fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('userForm');
    const messageDiv = document.getElementById('message');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Ambil data form
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const city = document.getElementById('city').value;
            
            // Tampilkan pesan sukses
            if (messageDiv) {
                messageDiv.textContent = `✅ Data ${name} berhasil disimpan!`;
                messageDiv.style.color = 'green';
                messageDiv.style.padding = '10px';
                messageDiv.style.backgroundColor = '#e6ffe6';
            }
            
            // Reset form
            form.reset();
            
            console.log("Data disimpan:", { name, email, phone, city });
            alert(`Data ${name} berhasil disimpan!`);
        });
    } else {
        console.log("Form tidak ditemukan");
    }
});
