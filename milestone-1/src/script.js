/**
 * Author: Hemant Gehlod
 * Date: March 23, 2025
 * Software Engineering Intern Assignment
 * Github: https://github.com/Hmtgit7/Digitalyz-Tech
 */

/**
 * My approach to this scheduling problem:
 * 1. I first prioritize courses based on student request types
 * 2. Then I analyze constraints to find compatible blocks
 * 3. Next, I assign students to sections while respecting capacity
 * 4. Finally, I generate views for students and teachers
 */

/**
 * Smart Scheduling Challenge - Data Cleaning and Transformation
 * 
 * This script converts the raw Excel data into a structured JSON format
 * for the Crestwood College scheduling system.
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Main function to clean and transform data
async function cleanAndTransformData(inputFile, outputFile) {
    console.log('Reading Excel file...');

    // Read the Excel file
    const fileData = await fs.promises.readFile(inputFile);
    const workbook = XLSX.read(fileData, { cellDates: true });

    // Extract data from each sheet
    const lecturers = XLSX.utils.sheet_to_json(workbook.Sheets['Lecturer Details']);
    const rooms = XLSX.utils.sheet_to_json(workbook.Sheets['Rooms data']);
    const courses = XLSX.utils.sheet_to_json(workbook.Sheets['Course list']);
    const requests = XLSX.utils.sheet_to_json(workbook.Sheets['Student requests']);

    console.log(`Found ${lecturers.length} lecturer records, ${rooms.length} room records, ${courses.length} courses, and ${requests.length} student requests.`);

    // Clean and transform data
    const cleanedData = {
        metadata: generateMetadata(lecturers, rooms, courses, requests),
        courses: cleanCourses(courses, lecturers, rooms),
        lecturers: cleanLecturers(lecturers),
        rooms: cleanRooms(rooms),
        students: cleanStudentRequests(requests),
        validation: generateValidationReport(lecturers, rooms, courses, requests)
    };

    // Write the cleaned data to a JSON file
    await fs.promises.writeFile(outputFile, JSON.stringify(cleanedData, null, 2));
    console.log(`Cleaned data saved to ${outputFile}`);

    return cleanedData;
}

// Generate metadata about the dataset
function generateMetadata(lecturers, rooms, courses, requests) {
    const uniqueStudents = new Set(requests.map(r => r['student ID'])).size;
    const uniqueLecturers = new Set(lecturers.map(l => l['Lecturer ID'])).size;
    const uniqueRooms = new Set(rooms.map(r => r['Room Number'])).size;

    return {
        totalStudents: uniqueStudents,
        totalLecturers: uniqueLecturers,
        totalCourses: courses.length,
        totalRooms: uniqueRooms,
        totalRequests: requests.length,
        blocks: ["1A", "1B", "2A", "2B", "3", "4A", "4B"], // From RULES sheet
        requestTypes: ["Required", "Requested", "Recommended"],
        generatedOn: new Date().toISOString()
    };
}

// Clean and transform course data
function cleanCourses(courses, lecturers, rooms) {
    // Create a map to store lecturer IDs by course code
    const lecturersByCourse = {};
    lecturers.forEach(l => {
        const code = l['lecture Code'];
        if (!lecturersByCourse[code]) {
            lecturersByCourse[code] = new Set();
        }
        lecturersByCourse[code].add(l['Lecturer ID']);
    });

    // Create a map to store room numbers by course code
    const roomsByCourse = {};
    rooms.forEach(r => {
        const code = r['Course Code'];
        if (!roomsByCourse[code]) {
            roomsByCourse[code] = new Set();
        }
        roomsByCourse[code].add(r['Room Number']);
    });

    // Clean and transform each course
    return courses.map(course => {
        return {
            courseCode: course['Course code'],
            title: (course['Title'] || '').trim(),
            length: course['Length'],
            priority: course['Priority'],
            availableBlocks: parseBlocks(course['Available blocks']),
            unavailableBlocks: parseBlocks(course['Unavailable blocks']),
            sectionSizes: {
                min: course['Minimum section size'],
                target: course['Target section size'],
                max: course['Maximum section size']
            },
            numberOfSections: course['Number of sections'],
            totalCredits: course['Total credits'],
            assignedRooms: roomsByCourse[course['Course code']]
                ? Array.from(roomsByCourse[course['Course code']])
                : [],
            lecturerIds: lecturersByCourse[course['Course code']]
                ? Array.from(lecturersByCourse[course['Course code']])
                : []
        };
    });
}

// Parse comma-separated block strings into arrays
function parseBlocks(blocksString) {
    if (!blocksString) return [];
    return blocksString.split(',').map(b => b.trim());
}

// Clean and transform lecturer data
function cleanLecturers(lecturers) {
    // Group by lecturer ID to combine courses taught by the same lecturer
    const lecturerMap = {};

    lecturers.forEach(l => {
        const id = l['Lecturer ID'];
        if (!lecturerMap[id]) {
            lecturerMap[id] = {
                lecturerId: id,
                courseCodes: [],
                sections: []
            };
        }

        // Add course code if not already present
        const courseCode = l['lecture Code'];
        if (!lecturerMap[id].courseCodes.includes(courseCode)) {
            lecturerMap[id].courseCodes.push(courseCode);
        }

        // Add section information
        lecturerMap[id].sections.push({
            courseCode: courseCode,
            sectionNumber: l['Section number'],
            startTerm: l['Start Term']
        });
    });

    // Convert map to array
    return Object.values(lecturerMap);
}

// Clean and transform room data
function cleanRooms(rooms) {
    // Group by room number
    const roomMap = {};

    rooms.forEach(r => {
        const roomNumber = r['Room Number'];
        if (!roomMap[roomNumber]) {
            roomMap[roomNumber] = {
                roomNumber,
                assignedCourses: []
            };
        }

        // Add course assignment
        roomMap[roomNumber].assignedCourses.push({
            courseCode: r['Course Code'],
            courseTitle: r['Course Title'],
            sectionNumber: r['Section number'],
            termName: r['Term name']
        });
    });

    // Convert map to array
    return Object.values(roomMap);
}

// Clean and transform student request data
function cleanStudentRequests(requests) {
    // Group requests by student ID
    const studentMap = {};

    requests.forEach(req => {
        const studentId = req['student ID'];
        if (!studentId) return; // Skip records with no student ID

        if (!studentMap[studentId]) {
            studentMap[studentId] = {
                studentId,
                collegeYear: req['College Year'],
                requests: []
            };
        }

        // Add request
        studentMap[studentId].requests.push({
            courseCode: req['Course code'],
            courseTitle: req['Title'],
            type: req['Type'],
            startTerm: req['Request start term'],
            length: req['Length'],
            priority: req['Priority'],
            department: req['Department(s)'],
            credits: req['Credits']
        });
    });

    // Convert map to array
    return Object.values(studentMap);
}

// Generate validation report with issues and insights
function generateValidationReport(lecturers, rooms, courses, requests) {
    const validationReport = {
        missingCourses: [],
        oversubscribedCourses: [],
        coursesWithoutRooms: [],
        coursesWithMultipleLecturers: []
    };

    // Find missing courses (courses requested but not in course list)
    const validCourseCodes = new Set(courses.map(c => c['Course code']));
    const requestedCourseCodes = new Set(requests.map(r => r['Course code']));

    requestedCourseCodes.forEach(code => {
        if (code && !validCourseCodes.has(code)) {
            validationReport.missingCourses.push(code);
        }
    });

    // Find oversubscribed courses
    const courseRequestCounts = {};
    requests.forEach(req => {
        const code = req['Course code'];
        if (validCourseCodes.has(code)) {
            courseRequestCounts[code] = (courseRequestCounts[code] || 0) + 1;
        }
    });

    courses.forEach(course => {
        const code = course['Course code'];
        const requestCount = courseRequestCounts[code] || 0;
        const capacity = course['Maximum section size'] * course['Number of sections'];

        if (requestCount > capacity) {
            validationReport.oversubscribedCourses.push({
                courseCode: code,
                title: course['Title'],
                requests: requestCount,
                capacity,
                ratio: requestCount / capacity
            });
        }
    });

    // Sort oversubscribed courses by demand ratio (highest first)
    validationReport.oversubscribedCourses.sort((a, b) => b.ratio - a.ratio);

    // Find courses without room assignments
    const coursesWithRooms = new Set(rooms.map(r => r['Course Code']));

    courses.forEach(course => {
        if (!coursesWithRooms.has(course['Course code'])) {
            validationReport.coursesWithoutRooms.push(course['Course code']);
        }
    });

    // Find courses with multiple lecturers
    const lecturersByCourse = {};
    lecturers.forEach(l => {
        const code = l['lecture Code'];
        if (!lecturersByCourse[code]) {
            lecturersByCourse[code] = new Set();
        }
        lecturersByCourse[code].add(l['Lecturer ID']);
    });

    Object.entries(lecturersByCourse).forEach(([code, lecturerSet]) => {
        if (lecturerSet.size > 1) {
            validationReport.coursesWithMultipleLecturers.push(code);
        }
    });

    return validationReport;
}

// Example usage
async function main() {
    try {
        await cleanAndTransformData('dataset.xlsx', 'output/cleaned_data.json');
        console.log('Data cleaning completed successfully.');
    } catch (error) {
        console.error('Error cleaning data:', error);
    }
}

main();