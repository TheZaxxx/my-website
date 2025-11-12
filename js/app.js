// SIMPLE FIREBASE SAVE - WORKING VERSION
console.log("App loaded, waiting for Firebase...");

// Tunggu Firebase siap
setTimeout(() => {
    const form = document.getElementById('userForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ambil data
        const userData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            city: document.getElementById('city').value,
            timestamp: new Date()
        };
        
        try {
            // Save ke Firebase
            await db.collection('users').add(userData);
            alert('✅ DATA BERHASIL DISIMPAN KE FIREBASE!');
            form.reset();
        } catch (error) {
            alert('❌ Error: ' + error.message);
        }
    });
    
    console.log("Form ready!");
}, 2000);
