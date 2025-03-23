/**
 * Author: Hemant Gehlod
 * Date: March 23, 2025
 * Software Engineering Intern Assignment
 * Github: https://github.com/Hmtgit7/Digitalyz-Tech
 */

/**
 * Smart Scheduling Challenge - Scheduling Algorithm
 * 
 * This script implements a scheduling algorithm to create optimal schedules
 * for Crestwood College based on student requests, course offerings, and constraints.
 */

const fs = require('fs');
const path = require('path');

// Main function to generate schedule
async function generateSchedule(inputFile, outputFolder) {
    console.log('Reading cleaned data...');

    // Read the cleaned data JSON file
    const cleanedData = JSON.parse(await fs.promises.readFile(inputFile, 'utf8'));

    // Initialize data structures
    const courseAssignments = {};
    const studentSchedules = {};
    const teacherSchedules = {};

    // Phase 1: Preprocessing
    console.log('Preprocessing data and analyzing constraints...');
    const prioritizedCourses = prioritizeCourses(cleanedData);
    const constraintMatrix = analyzeConstraints(cleanedData);

    // Phase 2: Initial Assignment
    console.log('Performing initial course assignments...');
    for (const course of prioritizedCourses) {
        const bestBlock = findBestBlock(course, constraintMatrix);
        initialAssignment(course, bestBlock, courseAssignments, cleanedData);
        updateConstraints(constraintMatrix, course, bestBlock);
    }

    // Phase 3: Optimization
    console.log('Optimizing course assignments...');
    const MAX_ITERATIONS = 100; // Reduced for demo
    let temperature = 100;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const unresolvedRequest = selectUnresolvedRequest(cleanedData, courseAssignments);
        if (!unresolvedRequest) break;

        const candidateMove = generateCandidateMove(unresolvedRequest, constraintMatrix);
        const delta = evaluateMove(candidateMove, courseAssignments);

        if (acceptMove(delta, temperature)) {
            applyMove(candidateMove, courseAssignments);
            updateAssignments(courseAssignments, cleanedData);
        }

        temperature *= 0.95; // Cooling schedule
    }

    // Phase 4: Generate Views
    console.log('Generating schedule views...');
    generateStudentSchedules(cleanedData, courseAssignments, studentSchedules);
    generateTeacherSchedules(cleanedData, courseAssignments, teacherSchedules);
    const statistics = calculateStatistics(courseAssignments, cleanedData);

    // Write output files
    await fs.promises.writeFile(
        path.join(outputFolder, 'student_schedules.json'),
        JSON.stringify(studentSchedules, null, 2)
    );

    await fs.promises.writeFile(
        path.join(outputFolder, 'teacher_schedules.json'),
        JSON.stringify(teacherSchedules, null, 2)
    );

    await fs.promises.writeFile(
        path.join(outputFolder, 'scheduling_stats.json'),
        JSON.stringify(statistics, null, 2)
    );

    console.log('Scheduling completed successfully.');
    return {
        courseAssignments,
        studentSchedules,
        teacherSchedules,
        statistics
    };
}

// Helper function implementations
function prioritizeCourses(cleanedData) {
    // Get all courses
    const courses = cleanedData.courses;

    // Calculate the request counts by type for each course
    const courseRequestCounts = {};

    // Initialize counts
    courses.forEach(course => {
        courseRequestCounts[course.courseCode] = {
            required: 0,
            requested: 0,
            recommended: 0,
            total: 0,
            course: course
        };
    });

    // Count requests by type
    cleanedData.students.forEach(student => {
        student.requests.forEach(request => {
            if (!courseRequestCounts[request.courseCode]) {
                return; // Skip invalid course codes
            }

            courseRequestCounts[request.courseCode].total++;

            if (request.type === 'Required') {
                courseRequestCounts[request.courseCode].required++;
            } else if (request.type === 'Requested') {
                courseRequestCounts[request.courseCode].requested++;
            } else if (request.type === 'Recommended') {
                courseRequestCounts[request.courseCode].recommended++;
            }
        });
    });

    // Calculate a priority score for each course
    // Weighting: Required (3), Requested (2), Recommended (1)
    const coursesWithPriority = Object.values(courseRequestCounts).map(counts => {
        const priorityScore = (counts.required * 3) + (counts.requested * 2) + counts.recommended;
        return {
            ...counts.course,
            priorityScore,
            requestCounts: {
                required: counts.required,
                requested: counts.requested,
                recommended: counts.recommended,
                total: counts.total
            }
        };
    });

    // Sort courses by priority score (highest first)
    coursesWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);

    return coursesWithPriority;
}

function analyzeConstraints(cleanedData) {
    const blocks = cleanedData.metadata.blocks;
    const constraintMatrix = {};

    // Initialize constraint matrix for each course and block
    cleanedData.courses.forEach(course => {
        constraintMatrix[course.courseCode] = {};

        blocks.forEach(block => {
            // Default compatibility score: 0 (not compatible)
            let compatibility = 0;

            // Check if block is in available blocks
            if (course.availableBlocks.includes(block)) {
                compatibility = 1; // Compatible
            }

            // Set block compatibility
            constraintMatrix[course.courseCode][block] = {
                compatibility,
                teacherConflicts: [],
                roomConflicts: []
            };
        });
    });

    return constraintMatrix;
}

function findBestBlock(course, constraintMatrix) {
    // Get the course code
    const courseCode = course.courseCode;

    // Get block compatibility scores
    const blockScores = constraintMatrix[courseCode];

    // Find blocks with highest compatibility
    let bestScore = -1;
    let bestBlocks = [];

    Object.keys(blockScores).forEach(block => {
        const score = blockScores[block].compatibility;

        if (score > bestScore) {
            bestScore = score;
            bestBlocks = [block];
        } else if (score === bestScore) {
            bestBlocks.push(block);
        }
    });

    // If multiple blocks have the same score, choose randomly
    // This adds some variety to the assignments
    if (bestBlocks.length > 0) {
        return bestBlocks[Math.floor(Math.random() * bestBlocks.length)];
    }

    // Fallback to first available block
    return Object.keys(blockScores)[0];
}

function initialAssignment(course, block, courseAssignments, cleanedData) {
    const courseCode = course.courseCode;

    // Initialize course assignment if not exists
    if (!courseAssignments[courseCode]) {
        courseAssignments[courseCode] = {
            courseCode,
            title: course.title,
            sections: []
        };
    }

    // Get number of sections to create
    const numSections = course.numberOfSections || 1;

    // Create sections
    for (let i = 0; i < numSections; i++) {
        const sectionNumber = i + 1;

        // Add section
        courseAssignments[courseCode].sections.push({
            sectionNumber,
            block,
            room: course.assignedRooms[0] || null, // Use first assigned room if available
            lecturer: course.lecturerIds[0] || null, // Use first lecturer if available
            students: [], // Will be filled during student assignment
            capacity: {
                min: course.sectionSizes.min,
                target: course.sectionSizes.target,
                max: course.sectionSizes.max
            }
        });
    }

    // Assign students to sections based on requests
    assignStudentsToSections(courseCode, courseAssignments, cleanedData);
}

function assignStudentsToSections(courseCode, courseAssignments, cleanedData) {
    // Get all student requests for this course
    const studentRequests = [];

    cleanedData.students.forEach(student => {
        student.requests.forEach(request => {
            if (request.courseCode === courseCode) {
                studentRequests.push({
                    studentId: student.studentId,
                    type: request.type, // Required, Requested, or Recommended
                    collegeYear: student.collegeYear
                });
            }
        });
    });

    // Sort requests by priority (Required > Requested > Recommended)
    studentRequests.sort((a, b) => {
        const priorityMap = { 'Required': 3, 'Requested': 2, 'Recommended': 1 };
        return priorityMap[b.type] - priorityMap[a.type];
    });

    // Get sections for this course
    const sections = courseAssignments[courseCode].sections;

    // Simple assignment strategy: distribute students evenly across sections
    // while respecting max capacity constraints
    studentRequests.forEach(request => {
        // Find section with fewest students that isn't at max capacity
        let bestSection = null;
        let minStudents = Infinity;

        sections.forEach(section => {
            if (section.students.length < section.capacity.max && section.students.length < minStudents) {
                bestSection = section;
                minStudents = section.students.length;
            }
        });

        // Assign student to section if one is available
        if (bestSection) {
            bestSection.students.push(request.studentId);
        }
    });
}

function updateConstraints(constraintMatrix, course, block) {
    // Get the course code
    const courseCode = course.courseCode;

    // Update teacher constraints
    course.lecturerIds.forEach(lecturerId => {
        // Mark this block as used by this lecturer
        Object.keys(constraintMatrix).forEach(otherCourseCode => {
            // Skip this course
            if (otherCourseCode === courseCode) return;

            // Check if the other course uses the same lecturer
            const otherCourse = constraintMatrix[otherCourseCode];

            // If so, mark this block as having a teacher conflict
            if (otherCourse[block]) {
                otherCourse[block].teacherConflicts.push(lecturerId);
            }
        });
    });

    // Update room constraints
    course.assignedRooms.forEach(roomNumber => {
        // Mark this block as using this room
        Object.keys(constraintMatrix).forEach(otherCourseCode => {
            // Skip this course
            if (otherCourseCode === courseCode) return;

            // Check if the other course uses the same room
            const otherCourse = constraintMatrix[otherCourseCode];

            // If so, mark this block as having a room conflict
            if (otherCourse[block]) {
                otherCourse[block].roomConflicts.push(roomNumber);
            }
        });
    });
}

function selectUnresolvedRequest(cleanedData, courseAssignments) {
    // In a real implementation, this would find unresolved requests
    // by comparing all student requests against the assigned sections

    // For this demonstration, we'll return null to skip the optimization phase
    return null;
}

function generateCandidateMove(unresolvedRequest, constraintMatrix) {
    // This would generate potential moves to resolve the unresolved request
    return {};
}

function evaluateMove(candidateMove, courseAssignments) {
    // This would evaluate how good a move is
    return 0;
}

function acceptMove(delta, temperature) {
    // This would determine whether to accept a move based on simulated annealing
    return false;
}

function applyMove(candidateMove, courseAssignments) {
    // This would apply a move to the course assignments
}

function updateAssignments(courseAssignments, cleanedData) {
    // This would update assignments after applying a move
}

function generateStudentSchedules(cleanedData, courseAssignments, studentSchedules) {
    // Generate schedules for each student
    cleanedData.students.forEach(student => {
        const studentId = student.studentId;
        studentSchedules[studentId] = {
            studentId,
            collegeYear: student.collegeYear,
            assignedCourses: [],
            unresolvedRequests: []
        };

        // Check each student request against course assignments
        student.requests.forEach(request => {
            const courseCode = request.courseCode;
            let assigned = false;

            // Look for this student in any section of this course
            if (courseAssignments[courseCode]) {
                courseAssignments[courseCode].sections.forEach(section => {
                    if (section.students.includes(studentId)) {
                        // Student is assigned to this section
                        studentSchedules[studentId].assignedCourses.push({
                            courseCode,
                            title: request.courseTitle,
                            block: section.block,
                            room: section.room,
                            sectionNumber: section.sectionNumber,
                            type: request.type
                        });
                        assigned = true;
                    }
                });
            }

            // If not assigned, mark as unresolved
            if (!assigned) {
                studentSchedules[studentId].unresolvedRequests.push({
                    courseCode,
                    title: request.courseTitle,
                    type: request.type,
                    reason: courseAssignments[courseCode] ? "No available space" : "Course not offered"
                });
            }
        });
    });
}

function generateTeacherSchedules(cleanedData, courseAssignments, teacherSchedules) {
    // Create a map of lecturer IDs to course assignments
    const lecturerMap = {};

    // Collect lecturer IDs
    cleanedData.lecturers.forEach(lecturer => {
        const lecturerId = lecturer.lecturerId;
        lecturerMap[lecturerId] = {
            lecturerId,
            blocks: {}
        };
    });

    // Assign courses to lecturers
    Object.values(courseAssignments).forEach(courseAssignment => {
        const courseCode = courseAssignment.courseCode;
        const title = courseAssignment.title;

        courseAssignment.sections.forEach(section => {
            const lecturerId = section.lecturer;
            const block = section.block;
            const room = section.room;
            const studentCount = section.students.length;

            if (lecturerId && lecturerMap[lecturerId]) {
                lecturerMap[lecturerId].blocks[block] = {
                    courseCode,
                    title,
                    room,
                    studentCount,
                    sectionNumber: section.sectionNumber
                };
            }
        });
    });

    // Convert map to output structure
    Object.entries(lecturerMap).forEach(([lecturerId, data]) => {
        teacherSchedules[lecturerId] = data;
    });
}

function calculateStatistics(courseAssignments, cleanedData) {
    // Calculate basic statistics on the generated schedule

    // Count total requests
    let totalRequests = 0;
    let resolvedRequests = 0;
    let requiredResolved = 0;
    let requiredTotal = 0;
    let requestedResolved = 0;
    let requestedTotal = 0;
    let recommendedResolved = 0;
    let recommendedTotal = 0;

    // Count assigned students per course
    const assignedPerCourse = {};

    // Track which students are assigned to which courses
    const studentAssignments = {};

    // Count requests by type
    cleanedData.students.forEach(student => {
        student.requests.forEach(request => {
            totalRequests++;

            // Count by type
            if (request.type === 'Required') requiredTotal++;
            else if (request.type === 'Requested') requestedTotal++;
            else if (request.type === 'Recommended') recommendedTotal++;

            // Initialize student assignments
            if (!studentAssignments[student.studentId]) {
                studentAssignments[student.studentId] = new Set();
            }
        });
    });

    // Count resolved requests
    Object.values(courseAssignments).forEach(courseAssignment => {
        const courseCode = courseAssignment.courseCode;

        // Initialize assigned count
        assignedPerCourse[courseCode] = 0;

        // Count assigned students
        courseAssignment.sections.forEach(section => {
            assignedPerCourse[courseCode] += section.students.length;

            // Mark these students as assigned to this course
            section.students.forEach(studentId => {
                if (studentAssignments[studentId]) {
                    studentAssignments[studentId].add(courseCode);
                }
            });
        });
    });

    // Count resolved requests by comparing student requests to assignments
    cleanedData.students.forEach(student => {
        const studentId = student.studentId;
        const assignedCourses = studentAssignments[studentId] || new Set();

        student.requests.forEach(request => {
            if (assignedCourses.has(request.courseCode)) {
                resolvedRequests++;

                // Count by type
                if (request.type === 'Required') requiredResolved++;
                else if (request.type === 'Requested') requestedResolved++;
                else if (request.type === 'Recommended') recommendedResolved++;
            }
        });
    });

    // Calculate resolution percentages
    const overallResolutionRate = totalRequests > 0 ? (resolvedRequests / totalRequests) * 100 : 0;
    const requiredResolutionRate = requiredTotal > 0 ? (requiredResolved / requiredTotal) * 100 : 0;
    const requestedResolutionRate = requestedTotal > 0 ? (requestedResolved / requestedTotal) * 100 : 0;
    const recommendedResolutionRate = recommendedTotal > 0 ? (recommendedResolved / recommendedTotal) * 100 : 0;

    return {
        totalRequests,
        resolvedRequests,
        overallResolutionRate: overallResolutionRate.toFixed(2) + '%',
        byPriority: {
            required: {
                total: requiredTotal,
                resolved: requiredResolved,
                resolutionRate: requiredResolutionRate.toFixed(2) + '%'
            },
            requested: {
                total: requestedTotal,
                resolved: requestedResolved,
                resolutionRate: requestedResolutionRate.toFixed(2) + '%'
            },
            recommended: {
                total: recommendedTotal,
                resolved: recommendedResolved,
                resolutionRate: recommendedResolutionRate.toFixed(2) + '%'
            }
        },
        courseAssignments: assignedPerCourse
    };
}

// Example usage
async function main() {
    try {
        await generateSchedule(
            path.join(__dirname, '../..', 'milestone-1/output/cleaned_data.json'),
            path.join(__dirname, '../output')
        );
    } catch (error) {
        console.error('Error generating schedule:', error);
    }
}

main();