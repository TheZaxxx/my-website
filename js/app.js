// Simple form handler
console.log("App.js loaded!");

document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Form berhasil disubmit! Data akan disimpan setelah Firebase setup lengkap.');
    
    // Tampilkan data yang diinput
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    console.log("Data:", name, email);
});
