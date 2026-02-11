const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'students.json');

// Simple session storage (in production, use Redis or database)
const sessions = new Map();

// Demo credentials - Multiple Admins with Department Access
const ADMIN_CREDENTIALS = [
    {
        username: 'adminmain',
        password: 'admingce',
        type: 'main',
        department: 'All Departments',
        color: '#FFD700', // Gold
        name: 'Main Administrator'
    },
    {
        username: 'admin-it',
        password: 'adminit123',
        type: 'department',
        department: 'BE - Information Technology',
        color: '#0984E3', // Electric Blue
        name: 'IT Department Admin'
    },
    {
        username: 'admin-cse',
        password: 'admincse123',
        type: 'department',
        department: 'BE - Computer Science and Engineering',
        color: '#9B59B6', // Purple
        name: 'CSE Department Admin'
    },
    {
        username: 'admin-ece',
        password: 'adminece123',
        type: 'department',
        department: 'BE - Electronics and Communication Engineering',
        color: '#27AE60', // Green
        name: 'ECE Department Admin'
    },
    {
        username: 'admin-eee',
        password: 'admineee123',
        type: 'department',
        department: 'BE - Electrical and Electronics Engineering',
        color: '#E67E22', // Orange
        name: 'EEE Department Admin'
    },
    {
        username: 'admin-mech',
        password: 'adminmech123',
        type: 'department',
        department: 'BE - Mechanical Engineering',
        color: '#E74C3C', // Red
        name: 'Mechanical Department Admin'
    },
    {
        username: 'admin-auto',
        password: 'adminauto123',
        type: 'department',
        department: 'BE - Automobile Engineering',
        color: '#00CEC9', // Cyan/Teal
        name: 'Automobile Department Admin'
    },
    {
        username: 'admin-civil',
        password: 'admincivil123',
        type: 'department',
        department: 'BE - Civil Engineering',
        color: '#8B4513', // Brown
        name: 'Civil Department Admin'
    }
];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function to read students data
async function readStudents() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { students: [] };
    }
}

// Helper function to write students data
async function writeStudents(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validation middleware
function validateStudent(req, res, next) {
    const { firstName, lastName, email, phone, course, year, cgpa } = req.body;
    const errors = [];

    if (!firstName || firstName.length < 2 || firstName.length > 50) {
        errors.push('First name must be between 2 and 50 characters');
    }

    if (!lastName || lastName.length < 2 || lastName.length > 50) {
        errors.push('Last name must be between 2 and 50 characters');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email is required');
    }

    if (!phone || !/^\d{10,15}$/.test(phone.replace(/[-\s]/g, ''))) {
        errors.push('Phone must be 10-15 digits');
    }

    if (!course || course.trim().length === 0) {
        errors.push('Course is required');
    }

    if (!year || year < 1 || year > 4) {
        errors.push('Year must be between 1 and 4');
    }

    if (cgpa !== undefined && (cgpa < 1 || cgpa > 10)) {
        errors.push('CGPA must be between 1.0 and 10.0');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
    }

    next();
}

// Authentication Helper Functions
function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function verifySession(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !sessions.has(token)) {
        return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    req.user = sessions.get(token);
    next();
}

// API Routes

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (role === 'admin') {
            // Admin login - check against multiple admin accounts
            const admin = ADMIN_CREDENTIALS.find(a => a.username === username && a.password === password);

            if (admin) {
                const token = generateToken();
                const sessionData = {
                    role: 'admin',
                    adminType: admin.type,
                    username: admin.name,
                    email: `${admin.username}@gce.edu.in`,
                    department: admin.department,
                    color: admin.color
                };

                sessions.set(token, sessionData);

                res.json({
                    success: true,
                    token,
                    ...sessionData
                });
            } else {
                res.status(401).json({ error: 'Invalid admin credentials' });
            }
        } else if (role === 'student') {
            // Student login - verify against student records
            const data = await readStudents();
            const student = data.students.find(s => s.email === username);

            if (!student) {
                return res.status(401).json({ error: 'Student not found' });
            }

            // Simple password check: student{lastName} (e.g., student001)
            const expectedPassword = `student${student.lastName}`;

            if (password === expectedPassword) {
                const token = generateToken();
                const sessionData = {
                    role: 'student',
                    username: `${student.firstName} ${student.lastName}`,
                    email: student.email,
                    studentId: student.id
                };

                sessions.set(token, sessionData);

                res.json({
                    success: true,
                    token,
                    ...sessionData
                });
            } else {
                res.status(401).json({ error: 'Invalid password' });
            }
        } else {
            res.status(400).json({ error: 'Invalid role' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        sessions.delete(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/verify', verifySession, (req, res) => {
    res.json({ success: true, user: req.user });
});

// GET all students (with optional search and department filtering)
app.get('/api/students', verifySession, async (req, res) => {
    try {
        const data = await readStudents();
        let students = data.students;

        // Filter by department for department admins
        if (req.user.role === 'admin' && req.user.adminType === 'department') {
            students = students.filter(s => s.course === req.user.department);
        }

        // Search functionality
        const { search, course, year } = req.query;

        if (search) {
            const searchLower = search.toLowerCase();
            students = students.filter(s =>
                s.firstName.toLowerCase().includes(searchLower) ||
                s.lastName.toLowerCase().includes(searchLower) ||
                s.email.toLowerCase().includes(searchLower) ||
                s.course.toLowerCase().includes(searchLower)
            );
        }

        if (course) {
            students = students.filter(s => s.course === course);
        }

        if (year) {
            students = students.filter(s => s.year === parseInt(year));
        }

        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve students' });
    }
});

// GET single student by ID
app.get('/api/students/:id', async (req, res) => {
    try {
        const data = await readStudents();
        const student = data.students.find(s => s.id === req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve student' });
    }
});

// POST create new student
app.post('/api/students', validateStudent, async (req, res) => {
    try {
        const data = await readStudents();

        // Check for duplicate email
        if (data.students.some(s => s.email === req.body.email)) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const newStudent = {
            id: generateId(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender || 'Not specified',
            address: req.body.address || '',
            enrollmentDate: req.body.enrollmentDate || new Date().toISOString().split('T')[0],
            course: req.body.course,
            year: parseInt(req.body.year),
            cgpa: parseFloat(req.body.cgpa) || 0,
            college: req.body.college || 'Government College of Engineering, Erode',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        data.students.push(newStudent);
        await writeStudents(data);

        res.status(201).json(newStudent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create student' });
    }
});

// PUT update student
app.put('/api/students/:id', validateStudent, async (req, res) => {
    try {
        const data = await readStudents();
        const index = data.students.findIndex(s => s.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Check for duplicate email (excluding current student)
        if (data.students.some(s => s.email === req.body.email && s.id !== req.params.id)) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const updatedStudent = {
            ...data.students[index],
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender || 'Not specified',
            address: req.body.address || '',
            enrollmentDate: req.body.enrollmentDate,
            course: req.body.course,
            year: parseInt(req.body.year),
            cgpa: parseFloat(req.body.cgpa) || 0,
            college: req.body.college || 'Government College of Engineering, Erode',
            updatedAt: new Date().toISOString()
        };

        data.students[index] = updatedStudent;
        await writeStudents(data);

        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// DELETE student
app.delete('/api/students/:id', async (req, res) => {
    try {
        const data = await readStudents();
        const index = data.students.findIndex(s => s.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const deletedStudent = data.students.splice(index, 1)[0];
        await writeStudents(data);

        res.json({ message: 'Student deleted successfully', student: deletedStudent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// GET statistics
app.get('/api/statistics', verifySession, async (req, res) => {
    try {
        const data = await readStudents();
        let students = data.students;

        // Filter by department for department admins
        if (req.user.role === 'admin' && req.user.adminType === 'department') {
            students = students.filter(s => s.course === req.user.department);
        }

        const stats = {
            totalStudents: students.length,
            averageCGPA: students.length > 0
                ? (students.reduce((sum, s) => sum + s.cgpa, 0) / students.length).toFixed(2)
                : 0,
            courseDistribution: students.reduce((acc, s) => {
                acc[s.course] = (acc[s.course] || 0) + 1;
                return acc;
            }, {}),
            yearDistribution: students.reduce((acc, s) => {
                acc[s.year] = (acc[s.year] || 0) + 1;
                return acc;
            }, {})
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve statistics' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Student Management System server running on http://localhost:${PORT}`);
});
