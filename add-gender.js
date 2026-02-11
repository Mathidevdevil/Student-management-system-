const fs = require('fs');
const path = require('path');

// Read the students.json file
const studentsFile = path.join(__dirname, 'students.json');
const data = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));

console.log(`Total students: ${data.students.length}`);

// Add gender to each student (alternating Male/Female for variety)
let maleCount = 0;
let femaleCount = 0;

data.students = data.students.map((student, index) => {
    // If student already has gender, keep it
    if (student.gender) {
        if (student.gender === 'Male') maleCount++;
        if (student.gender === 'Female') femaleCount++;
        return student;
    }

    // Assign gender based on pattern (roughly 50/50 split)
    // Use student ID hash for consistent assignment
    const gender = index % 2 === 0 ? 'Male' : 'Female';

    if (gender === 'Male') maleCount++;
    else femaleCount++;

    return {
        ...student,
        gender: gender
    };
});

// Write back to file
fs.writeFileSync(studentsFile, JSON.stringify(data, null, 2));

console.log('✅ Gender field added to all students!');
console.log(`   Male students: ${maleCount}`);
console.log(`   Female students: ${femaleCount}`);
console.log(`   Total: ${data.students.length}`);
