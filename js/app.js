// Main Application Logic
class UserRegistrationApp {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUsers();
    }

    bindEvents() {
        // Form submission
        document.getElementById('userForm').addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();
        this.saveUserData();
    }

    getUserData() {
        return {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            city: document.getElementById('city').value.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    validateUserData(userData) {
        if (!userData.name) {
            throw new Error('Nama harus diisi');
        }

        if (!userData.email) {
            throw new Error('Email harus diisi');
        }

        if (!this.isValidEmail(userData.email)) {
            throw new Error('Format email tidak valid');
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async saveUserData() {
        const submitBtn = document.querySelector('.submit-btn');
        const userData = this.getUserData();

        try {
            // Validasi data
            this.validateUserData(userData);

            // Show loading state
            this.setLoadingState(true);

            // Save to Firebase
            const docRef = await db.collection('users').add(userData);
            
            this.showMessage('Data berhasil disimpan!', 'success');
            this.clearForm();
            this.loadUsers(); // Refresh users list

        } catch (error) {
            console.error('Error menyimpan data:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        const submitBtn = document.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');

        if (isLoading) {
            submitBtn.classList.add('loading');
            btnText.style.display = 'none';
            loadingSpinner.style.display = 'inline-block';
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            btnText.style.display = 'inline-block';
            loadingSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    clearForm() {
        document.getElementById('userForm').reset();
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 5000);
    }

    async loadUsers() {
        try {
            const querySnapshot = await db.collection('users')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            this.displayUsers(querySnapshot);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showMessage('Error memuat data user', 'error');
        }
    }

    displayUsers(querySnapshot) {
        const usersList = document.getElementById('usersList');
        
        if (querySnapshot.empty) {
            usersList.innerHTML = '<p class="no-users">Belum ada user yang terdaftar</p>';
            return;
        }

        const usersHTML = querySnapshot.docs.map(doc => {
            const user = doc.data();
            const date = user.createdAt?.toDate?.() || new Date();
            
            return `
                <div class="user-card">
                    <h3>${this.escapeHtml(user.name)}</h3>
                    <p class="user-email">${this.escapeHtml(user.email)}</p>
                    ${user.phone ? `<p>📱 ${this.escapeHtml(user.phone)}</p>` : ''}
                    ${user.city ? `<p>🏠 ${this.escapeHtml(user.city)}</p>` : ''}
                    <small>Daftar pada: ${date.toLocaleDateString('id-ID')}</small>
                </div>
            `;
        }).join('');

        usersList.innerHTML = usersHTML;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UserRegistrationApp();
});