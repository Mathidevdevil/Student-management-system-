// API Base URL
const API_URL = '/api';

// State
let students = [];
let currentStudentId = null;
let deleteStudentId = null;

// DOM Elements
const studentTableBody = document.getElementById('student-table-body');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const courseFilter = document.getElementById('course-filter');
const yearFilter = document.getElementById('year-filter');
const addStudentBtn = document.getElementById('add-student-btn');
const studentModal = document.getElementById('student-modal');
const deleteModal = document.getElementById('delete-modal');
const studentForm = document.getElementById('student-form');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const closeDeleteModalBtn = document.getElementById('close-delete-modal-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const toast = document.getElementById('toast');

// Statistics Elements
const totalStudentsEl = document.getElementById('total-students');
const averageCgpaEl = document.getElementById('average-cgpa');
const totalCoursesEl = document.getElementById('total-courses');

// Theme Toggle Elements
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

// User Info Elements
const userNameEl = document.getElementById('user-name');
const userRoleEl = document.getElementById('user-role');
const logoutBtn = document.getElementById('logout-btn');

// Session Data
let userSession = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    verifySession();
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
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
}

// Apply Admin Theme Color
function applyAdminTheme(color, department) {
    // Set CSS custom property for admin color
    document.documentElement.style.setProperty('--admin-color', color);

    // Apply to header
    const header = document.querySelector('.header');
    if (header) {
        header.style.background = `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
        header.style.borderBottomColor = color;
    }

    // Apply to buttons
    const style = document.createElement('style');
    style.id = 'admin-theme-override';
    style.textContent = `
        .btn-primary {
            background: ${color} !important;
        }
        .btn-primary:hover {
            background: ${color}dd !important;
            filter: brightness(1.1);
        }
        .student-table thead {
            background: ${color} !important;
        }
        .modal-header {
            background: ${color} !important;
        }
        .stat-value {
            color: ${color} !important;
        }
        .stat-card:hover {
            border-color: ${color} !important;
        }
        .search-input:focus,
        .filter-select:focus,
        .form-group input:focus,
        .form-group select:focus {
            border-color: ${color} !important;
            box-shadow: 0 0 0 3px ${color}33 !important;
        }
    `;

    // Remove old theme if exists
    const oldTheme = document.getElementById('admin-theme-override');
    if (oldTheme) oldTheme.remove();

    document.head.appendChild(style);
}

// Session Management
function verifySession() {
    const sessionData = localStorage.getItem('userSession');

    if (!sessionData) {
        // No session, redirect to login
        window.location.href = 'login.html';
        return;
    }

    try {
        userSession = JSON.parse(sessionData);

        // Validate session has required fields
        if (!userSession.role || !userSession.username) {
            console.error('Invalid session data - missing role or username');
            localStorage.removeItem('userSession');
            alert('Your session is invalid. Please login again.');
            window.location.href = 'login.html';
            return;
        }

        // CRITICAL: Check if student session has studentId
        if (userSession.role === 'student' && !userSession.studentId) {
            console.error('Student session missing studentId - old session detected');
            localStorage.removeItem('userSession');
            alert('Please login again to update your session.');
            window.location.href = 'login.html';
            return;
        }

        // Display user info
        if (userNameEl) userNameEl.textContent = userSession.username;
        if (userRoleEl) {
            if (userSession.role === 'admin') {
                const deptText = userSession.adminType === 'main' ? 'Main Administrator' : `${userSession.department.replace('BE - ', '')} Admin`;
                userRoleEl.textContent = deptText;
            } else {
                userRoleEl.textContent = 'Student';
            }
        }

        // Apply department color for admins
        if (userSession.role === 'admin' && userSession.color) {
            applyAdminTheme(userSession.color, userSession.department);
        }

        // Initialize app
        initializeTheme();
        setupEventListeners();
        setDefaultDate();

        // Hide admin-only features for students
        if (userSession.role === 'student') {
            restrictStudentAccess();
        }

        // Load students last (after UI is set up)
        loadStudents();
    } catch (error) {
        // Invalid session
        console.error('Session verification error:', error);
        localStorage.removeItem('userSession');
        alert('Session error. Please login again.');
        window.location.href = 'login.html';
    }
}

function restrictStudentAccess() {
    // Students can only view their own record
    const addBtn = document.getElementById('add-student-btn');
    if (addBtn) addBtn.style.display = 'none';

    // Hide search and filters for students
    const searchContainer = document.querySelector('.search-container');
    const filterContainer = document.querySelector('.filter-container');
    if (searchContainer) searchContainer.style.display = 'none';
    if (filterContainer) filterContainer.style.display = 'none';

    // Update statistics to show only student's info
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsSection.innerHTML = `
            <div class="stat-card" style="grid-column: 1 / -1;">
                <div class="stat-icon">👤</div>
                <div class="stat-content">
                    <h3 class="stat-value">My Profile</h3>
                    <p class="stat-label">Student Information</p>
                </div>
            </div>
        `;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
    }
}

// Event Listeners
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    logoutBtn.addEventListener('click', logout);
    addStudentBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    studentForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);
    courseFilter.addEventListener('change', handleFilter);
    yearFilter.addEventListener('change', handleFilter);
    closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', handleDelete);

    // Close modal on outside click
    studentModal.addEventListener('click', (e) => {
        if (e.target === studentModal) closeModal();
    });
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
}

// Set default enrollment date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('enrollment-date').value = today;
}

// API Functions
async function fetchStudents(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_URL}/students?${queryString}` : `${API_URL}/students`;

        // Get token from session
        const token = userSession?.token;
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error('Failed to fetch students');
        return await response.json();
    } catch (error) {
        showToast('Error loading students', 'error');
        console.error(error);
        return [];
    }
}

async function fetchStatistics() {
    try {
        const token = userSession?.token;
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/statistics`, { headers });
        if (!response.ok) throw new Error('Failed to fetch statistics');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function createStudent(studentData) {
    try {
        const token = userSession?.token;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers,
            body: JSON.stringify(studentData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create student');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function updateStudent(id, studentData) {
    try {
        const token = userSession?.token;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(studentData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update student');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function deleteStudent(id) {
    try {
        const token = userSession?.token;
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to delete student');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Load and Display Students
async function loadStudents() {
    students = await fetchStudents();

    // If student role, filter to show only their own record
    if (userSession && userSession.role === 'student') {
        students = students.filter(s => s.id === userSession.studentId);
    }

    renderStudents(students);
    updateFilteredStatistics(students); // Use filtered stats for consistency
    updateCourseFilter();
}

function renderStudents(studentsToRender) {
    const isStudent = userSession && userSession.role === 'student';

    if (!studentsToRender || studentsToRender.length === 0) {
        if (emptyState) emptyState.classList.add('show');
        return;
    }

    if (emptyState) emptyState.classList.remove('show');

    // For students, show profile card instead of table
    if (isStudent && studentsToRender.length === 1) {
        const student = studentsToRender[0];

        // Hide table, show profile card
        const tableSection = document.querySelector('.table-section');
        if (tableSection) tableSection.style.display = 'none';

        // Create or get profile container
        let profileContainer = document.querySelector('.student-profile-container');
        if (!profileContainer) {
            profileContainer = document.createElement('div');
            profileContainer.className = 'student-profile-container';
            if (tableSection && tableSection.parentNode) {
                tableSection.parentNode.insertBefore(profileContainer, tableSection);
            } else {
                // Fallback: append to main container
                const mainContainer = document.querySelector('.container');
                if (mainContainer) mainContainer.appendChild(profileContainer);
            }
        }

        profileContainer.classList.add('show');
        profileContainer.innerHTML = `
            <div class="profile-card">
                <div class="profile-header">
                    <div class="profile-avatar">👨‍🎓</div>
                    <h2 class="profile-name">${student.firstName} ${student.lastName}</h2>
                    <p class="profile-email">${student.email}</p>
                </div>
                
                <div class="profile-details">
                    <div class="detail-item">
                        <div class="detail-label">📧 Email Address</div>
                        <div class="detail-value">${student.email}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">📱 Phone Number</div>
                        <div class="detail-value">${student.phone}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">${student.gender === 'Male' ? '👨' : student.gender === 'Female' ? '👩' : '👤'} Gender</div>
                        <div class="detail-value">${student.gender || 'Not specified'}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">📚 Course</div>
                        <div class="detail-value">${student.course}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">📅 Year</div>
                        <div class="detail-value">Year ${student.year}</div>
                    </div>
                    
                    <div class="detail-item highlight">
                        <div class="detail-label">🎯 CGPA</div>
                        <div class="detail-value">${student.cgpa.toFixed(2)} / 10.0</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">📆 Enrollment Date</div>
                        <div class="detail-value">${formatDate(student.enrollmentDate)}</div>
                    </div>
                    
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <div class="detail-label">🏠 Address</div>
                        <div class="detail-value">${student.address || 'Not provided'}</div>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="btn btn-primary" onclick="openEditModal('${student.id}')">
                        <span>✏️</span>
                        <span>Edit My Profile</span>
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // For admin, show table as usual
    if (!studentTableBody) return;

    studentTableBody.innerHTML = '';

    studentsToRender.forEach(student => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>${student.gender || 'N/A'}</td>
            <td>${student.course}</td>
            <td>Year ${student.year}</td>
            <td>${student.cgpa.toFixed(2)}</td>
            <td>${formatDate(student.enrollmentDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="openEditModal('${student.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="openDeleteModal('${student.id}')">Delete</button>
                </div>
            </td>
        `;
        studentTableBody.appendChild(row);
    });
}

// Update Statistics
async function updateStatistics() {
    const stats = await fetchStatistics();
    if (!stats) return;

    totalStudentsEl.textContent = stats.totalStudents;
    averageCgpaEl.textContent = stats.averageCGPA;
    totalCoursesEl.textContent = Object.keys(stats.courseDistribution).length;
}

// Update Course Filter
function updateCourseFilter() {
    const courses = [...new Set(students.map(s => s.course))].sort();
    courseFilter.innerHTML = '<option value="">All Courses</option>';
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseFilter.appendChild(option);
    });
}

// Search and Filter
async function handleSearch() {
    await handleFilter();
}

async function handleFilter() {
    const searchTerm = searchInput.value;
    const course = courseFilter.value;
    const year = yearFilter.value;

    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (course) params.course = course;
    if (year) params.year = year;

    const filteredStudents = await fetchStudents(params);
    renderStudents(filteredStudents);

    // Update statistics to show filtered results
    updateFilteredStatistics(filteredStudents);
}

// Update statistics based on filtered students
function updateFilteredStatistics(studentsArray) {
    if (!studentsArray || studentsArray.length === 0) {
        totalStudentsEl.textContent = '0';
        averageCgpaEl.textContent = '0.00';
        totalCoursesEl.textContent = '0';
        return;
    }

    // Calculate statistics from filtered students
    const totalStudents = studentsArray.length;
    const averageCGPA = (studentsArray.reduce((sum, s) => sum + s.cgpa, 0) / totalStudents).toFixed(2);
    const uniqueCourses = [...new Set(studentsArray.map(s => s.course))].length;

    totalStudentsEl.textContent = totalStudents;
    averageCgpaEl.textContent = averageCGPA;
    totalCoursesEl.textContent = uniqueCourses;
}

// Modal Functions
function openAddModal() {
    currentStudentId = null;
    modalTitle.textContent = 'Add New Student';
    studentForm.reset();
    setDefaultDate();
    studentModal.classList.add('show');
}

function openEditModal(id) {
    currentStudentId = id;
    modalTitle.textContent = 'Edit Student';

    const student = students.find(s => s.id === id);
    if (!student) return;

    document.getElementById('first-name').value = student.firstName;
    document.getElementById('last-name').value = student.lastName;
    document.getElementById('email').value = student.email;
    document.getElementById('phone').value = student.phone;
    document.getElementById('gender').value = student.gender || '';
    document.getElementById('address').value = student.address || '';
    document.getElementById('course').value = student.course;
    document.getElementById('year').value = student.year;
    document.getElementById('cgpa').value = student.cgpa;
    document.getElementById('enrollment-date').value = student.enrollmentDate;

    studentModal.classList.add('show');
}

function closeModal() {
    studentModal.classList.remove('show');
    studentForm.reset();
    currentStudentId = null;
}

function openDeleteModal(id) {
    deleteStudentId = id;
    deleteModal.classList.add('show');
}

function closeDeleteModal() {
    deleteModal.classList.remove('show');
    deleteStudentId = null;
}

// Form Submit Handler
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(studentForm);
    const studentData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        gender: formData.get('gender'),
        address: formData.get('address'),
        course: formData.get('course'),
        year: parseInt(formData.get('year')),
        cgpa: parseFloat(formData.get('cgpa')),
        enrollmentDate: formData.get('enrollmentDate')
    };

    try {
        if (currentStudentId) {
            await updateStudent(currentStudentId, studentData);
            showToast('Student updated successfully', 'success');
        } else {
            await createStudent(studentData);
            showToast('Student added successfully', 'success');
        }

        closeModal();
        await loadStudents();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Delete Handler
async function handleDelete() {
    if (!deleteStudentId) return;

    try {
        await deleteStudent(deleteStudentId);
        showToast('Student deleted successfully', 'success');
        closeDeleteModal();
        await loadStudents();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Make functions globally accessible for inline event handlers
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
