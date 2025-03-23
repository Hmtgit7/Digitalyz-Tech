# Data Validation and Insights Report

## Dataset Overview

The Crestwood College dataset contains information about:
- **156 students** with 1,259 course requests
- **75 unique courses** offered
- **23 lecturers** teaching these courses
- **20 classrooms** available for scheduling

## Data Quality Issues

### Missing Courses
Six course codes appear in student requests but are not defined in the Course List:

| Course Code | Course Title | Request Count |
|-------------|--------------|--------------|
| STUDY | Study Hall | 52 |
| INTERN1 | Executive Internship I | 4 |
| INTERN2 | Executive Internship II | 4 |
| INDSTUDY1 | Independent Study 1 | 1 |
| INDSTUDY2 | Independent Study 2 | 1 |
| NULL | (No course code) | 0 |

These missing courses account for 62 student requests (approximately 5% of all requests). For scheduling purposes, these should either be added to the course catalog or marked as unresolvable requests.

### Courses Without Room Assignments
Seven courses in the Course List do not have room assignments in the Rooms data:

1. Living Well (LIVEWELL)
2. Fundamental Math (MATFUND)
3. Pre-Algebra Honors 7 (MATHPreALGH7)
4. Pre-Algebra (MATPreALG)
5. Transitional Math (MATTRAN)
6. (and 2 more)

These courses will need room assignments before scheduling can be completed.

### Oversubscribed Courses
Several courses have more student requests than available capacity:

| Course | Requests | Capacity | Ratio |
|--------|----------|----------|-------|
| Digital Imaging & Editing (TECHDIGIT) | 33 | 26 | 1.27 |
| Alg II Honors (MATALG2H) | 31 | 26 | 1.19 |
| Dual Enrollment English 151 (DEENG151) | 30 | 26 | 1.15 |
| World History (SOC11) | 29 | 26 | 1.12 |

The scheduling algorithm will need to prioritize requests for these courses based on request type (Required > Requested > Recommended).

### Courses with Multiple Lecturers
Two courses have multiple lecturers assigned:

1. Bible 9 (BIB9): 2 lecturers
2. Algebra II (MATALG2): 2 lecturers

This requires careful scheduling to avoid conflicts and ensure the right lecturer is assigned to each section.

## Scheduling Insights

### Request Distribution by Priority
- **Required**: 178 requests (14.14%)
- **Requested**: 963 requests (76.49%)
- **Recommended**: 118 requests (9.37%)

The high percentage of "Requested" versus "Required" courses suggests flexibility in scheduling, but priority must be given to the "Required" courses first.

### Request Distribution by Term
- **First term**: 1,081 requests (85.86%)
- **Second Term**: 129 requests (10.25%)
- **Any term**: 49 requests (3.89%)

The strong preference for First term courses indicates potential scheduling bottlenecks at the beginning of the academic year.

### Student Request Patterns
- **Average requests per student**: 8.07
- **Maximum requests by a student**: 14
- **Minimum requests by a student**: 1

The wide range in the number of requests per student suggests varying course loads that need to be accommodated.

### Department Request Distribution
Top 5 departments by request volume:
1. Social Studies: 216 requests (17.16%)
2. Science: 178 requests (14.14%)
3. Mathematics: 173 requests (13.74%)
4. English: 172 requests (13.66%)
5. Bible: 158 requests (12.55%)

These five departments account for over 70% of all requests and should be prioritized in scheduling.

### Room Usage Patterns
Top 5 most assigned rooms:
1. Room 113: 9 course assignments
2. Room 128: 8 course assignments
3. Room 114: 7 course assignments
4. Room 122: 7 course assignments
5. Room 125: 7 course assignments

These high-use rooms may become bottlenecks in scheduling and should be carefully managed.

## Scheduling Challenges and Recommendations

### 1. Oversubscription Management
For oversubscribed courses, we recommend:
- Adding additional sections where possible
- Strictly enforcing priority rules (Required > Requested > Recommended)
- Considering alternatives for students who cannot be accommodated

### 2. Missing Course Handling
For the missing courses (especially Study Hall, which has 52 requests):
- Add these courses to the catalog with appropriate parameters
- Assign rooms and lecturers to make them schedulable
- If they cannot be offered, mark these requests as "unresolvable"

### 3. Room Assignment Strategy
- Assign specific rooms to the 7 courses currently without room assignments
- Consider room capacity and special requirements (e.g., lab equipment for science courses)

### 4. Block Scheduling Optimization
- Distribute high-demand courses across multiple blocks
- Ensure no conflicts for courses commonly requested together
- Balance teacher and room loads across all blocks

## Conclusion

The data cleaning process has revealed several important insights and challenges for the scheduling system. By addressing the identified data quality issues and considering the scheduling insights, we can develop a more effective scheduling algorithm in Milestone 2.

The cleaned data structure provides a solid foundation for implementing the scheduling algorithm, with clear relationships between courses, lecturers, rooms, and student requests.