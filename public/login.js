// Login page JavaScript
let currentRole = 'admin';

// Theme Toggle Elements
const themeToggleLogin = document.getElementById('theme-toggle-login');
const themeIconLogin = document.getElementById('theme-icon-login');
const themeTextLogin = document.getElementById('theme-text-login');

// Role Buttons
const adminRoleBtn = document.getElementById('admin-role-btn');
const studentRoleBtn = document.getElementById('student-role-btn');

// Form Elements
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const usernameLabel = document.getElementById('username-label');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');

// Demo Credentials
const adminCreds = document.getElementById('admin-creds');
const studentCreds = document.getElementById('student-creds');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupEventListeners();
    checkExistingSession();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    if (theme === 'dark') {
        themeIconLogin.textContent = '☀️';
        themeTextLogin.textContent = 'Light Mode';
    } else {
        themeIconLogin.textContent = '🌙';
        themeTextLogin.textContent = 'Dark Mode';
    }
}

// Event Listeners
function setupEventListeners() {
    themeToggleLogin.addEventListener('click', toggleTheme);
    adminRoleBtn.addEventListener('click', () => switchRole('admin'));
    studentRoleBtn.addEventListener('click', () => switchRole('student'));
    loginForm.addEventListener('submit', handleLogin);
}

// Role Switching
function switchRole(role) {
    currentRole = role;

    // Update button states
    if (role === 'admin') {
        adminRoleBtn.classList.add('active');
        studentRoleBtn.classList.remove('active');
        usernameLabel.textContent = 'Admin Username';
        usernameInput.placeholder = '';
        usernameInput.value = '';
        passwordInput.value = '';
        adminCreds.style.display = 'block';
        studentCreds.style.display = 'none';
    } else {
        studentRoleBtn.classList.add('active');
        adminRoleBtn.classList.remove('active');
        usernameLabel.textContent = 'Student Email';
        usernameInput.placeholder = 'student001@gce.edu.in';
        usernameInput.value = '';
        passwordInput.value = '';
        adminCreds.style.display = 'none';
        studentCreds.style.display = 'block';
    }

    hideError();
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    hideError();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                role: currentRole
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store session with all data from server
            const sessionData = {
                role: data.role,
                username: data.username,
                email: data.email,
                token: data.token,
                loginTime: new Date().toISOString()
            };

            // CRITICAL: Add studentId for student logins
            if (data.studentId) {
                sessionData.studentId = data.studentId;
            }

            // Add admin-specific data
            if (data.role === 'admin') {
                sessionData.adminType = data.adminType;
                sessionData.department = data.department;
                sessionData.color = data.color;
            }

            localStorage.setItem('userSession', JSON.stringify(sessionData));

            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            showError(data.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        showError('Connection error. Please make sure the server is running.');
        console.error('Login error:', error);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

// Check Existing Session
function checkExistingSession() {
    const session = localStorage.getItem('userSession');
    if (session) {
        try {
            const sessionData = JSON.parse(session);
            // If session exists, redirect to dashboard
            window.location.href = 'index.html';
        } catch (error) {
            // Invalid session, clear it
            localStorage.removeItem('userSession');
        }
    }
}

// Error Handling
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}
