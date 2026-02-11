const fs = require('fs');

const studentsData = JSON.parse(fs.readFileSync('students.json', 'utf8'));
const students = studentsData.students;

const targets = [
    { username: 'admin-cse', department: 'BE - Computer Science and Engineering' },
    { username: 'admin-ece', department: 'BE - Electronics and Communication Engineering' }
];

targets.forEach(admin => {
    const filtered = students.filter(s => s.course === admin.department);
    console.log(`${admin.username}: sees ${filtered.length} students`);
    if (filtered.length === 0) {
        console.log(`  -> ZERO students found for '${admin.department}'`);
        // Check exact match
        const any = students.find(s => s.course.includes('Computer') || s.course.includes('Electronics'));
        if (any) {
            console.log(`  -> Sample from DB: '${any.course}'`);
            console.log(`  -> Compare: '${admin.department}' === '${any.course}' ? ${admin.department === any.course}`);
            console.log(`  -> Lengths: ${admin.department.length} vs ${any.course.length}`);
        }
    }
});
