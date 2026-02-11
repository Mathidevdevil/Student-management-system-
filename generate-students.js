const fs = require('fs');

// Engineering courses for Government College of Engineering, Erode
const courses = [
    'BE - Information Technology',
    'BE - Computer Science and Engineering',
    'BE - Electronics and Communication Engineering',
    'BE - Electrical and Electronics Engineering',
    'BE - Mechanical Engineering',
    'BE - Automobile Engineering',
    'BE - Civil Engineering'
];

const collegeName = 'Government College of Engineering, Erode';

const cities = [
    'Erode, Tamil Nadu',
    'Coimbatore, Tamil Nadu',
    'Salem, Tamil Nadu',
    'Tirupur, Tamil Nadu',
    'Namakkal, Tamil Nadu',
    'Karur, Tamil Nadu',
    'Dharmapuri, Tamil Nadu',
    'Krishnagiri, Tamil Nadu',
    'Tiruchengode, Tamil Nadu',
    'Gobichettipalayam, Tamil Nadu'
];

const streets = [
    'Anna Nagar', 'Gandhi Road', 'Perundurai Road', 'Sathy Road', 'Bhavani Road',
    'Karur Road', 'Salem Road', 'Coimbatore Road', 'Main Street', 'Station Road',
    'Bazaar Street', 'College Road', 'Veerappan Chatram', 'Rangampalayam', 'Surampatti'
];

// Helper functions
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomCGPA() {
    return (Math.random() * 3 + 6).toFixed(2); // CGPA between 6.0 and 9.0
}

function randomDate(start, end) {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function generatePhone() {
    // Indian phone numbers starting with 6, 7, 8, or 9
    const firstDigit = [6, 7, 8, 9][randomInt(0, 3)];
    const remaining = Array.from({ length: 9 }, () => randomInt(0, 9)).join('');
    return `${firstDigit}${remaining}`;
}

// Generate students
function generateStudents(count) {
    const students = [];
    const startDate = new Date('2020-06-01');
    const endDate = new Date('2025-08-31');

    for (let i = 1; i <= count; i++) {
        // Generate student number with leading zeros
        const studentNumber = i.toString().padStart(3, '0');
        const firstName = `Student`;
        const lastName = studentNumber;

        // Generate email based on student number
        const email = `student${studentNumber}@gce.edu.in`;

        const student = {
            id: generateId(),
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: generatePhone(),
            address: `${randomInt(1, 999)}, ${randomChoice(streets)}, ${randomChoice(cities)}`,
            enrollmentDate: randomDate(startDate, endDate),
            course: randomChoice(courses),
            year: randomInt(1, 4),
            cgpa: parseFloat(randomCGPA()),
            college: collegeName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        students.push(student);
    }

    return students;
}

// Generate 320 students
const students = generateStudents(320);

// Write to file
const data = { students };
fs.writeFileSync('students.json', JSON.stringify(data, null, 2));

console.log(`✅ Successfully generated ${students.length} student records!`);
console.log(`🏛️  College: ${collegeName}`);
console.log(`📊 Statistics:`);
console.log(`   - Total Students: ${students.length}`);
console.log(`   - Unique Courses: ${courses.length}`);
console.log(`   - Average CGPA: ${(students.reduce((sum, s) => sum + s.cgpa, 0) / students.length).toFixed(2)}`);
console.log(`   - Courses: ${courses.map(c => c.split(' - ')[1]).join(', ')}`);
console.log(`\n🔄 Restart the server to see the new data!`);
