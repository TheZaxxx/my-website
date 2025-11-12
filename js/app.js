// DOM Elements
const startMiningBtn = document.getElementById('startMiningBtn');
const authModal = document.getElementById('authModal');
const closeModal = document.querySelector('.close');
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Modal functionality
startMiningBtn.addEventListener('click', () => {
    authModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    authModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.style.display = 'none';
    }
});

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        
        // Update active tab
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding form
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tab}Form`) {
                form.classList.add('active');
            }
        });
    });
});

// Form submissions
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await loginUser(email, password);
        showNotification('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    try {
        await registerUser(email, password);
        showNotification('Registration successful! Welcome to QuantumMine.', 'success');
        authModal.style.display = 'none';
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Notification system
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 10px;
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
    }
`;
document.head.appendChild(style);
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and mining stats
document.querySelectorAll('.feature-card, .mining-stat').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Real-time clock in dashboard preview
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const clockElement = document.querySelector('.dashboard-header span');
    if (clockElement && !clockElement.querySelector('.clock')) {
        clockElement.innerHTML = `Live Mining Dashboard - <span class="clock">${timeString}</span>`;
    } else if (clockElement) {
        clockElement.querySelector('.clock').textContent = timeString;
    }
}

setInterval(updateClock, 1000);
updateClock();

// Enhanced form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Add real-time validation
document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('blur', () => {
        if (!validateEmail(input.value)) {
            input.style.borderColor = '#ef4444';
        } else {
            input.style.borderColor = '#00d4ff';
        }
    });
});

document.querySelectorAll('input[type="password"]').forEach(input => {
    input.addEventListener('blur', () => {
        if (!validatePassword(input.value)) {
            input.style.borderColor = '#ef4444';
        } else {
            input.style.borderColor = '#00d4ff';
        }
    });
});

// Particle system enhancement
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    // Clear existing particles
    particlesContainer.innerHTML = '';
    
    // Create more particles
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.animationDelay = `${Math.random() * 4}s`;
        particlesContainer.appendChild(particle);
    }
}

createParticles();

// Add loading states for buttons
document.querySelectorAll('button[type="submit"]').forEach(button => {
    button.addEventListener('click', function() {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        this.disabled = true;
        
        // Reset after 3 seconds (for demo)
        setTimeout(() => {
            this.innerHTML = originalText;
            this.disabled = false;
        }, 3000);
    });
});
