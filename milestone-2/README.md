# Smart Scheduling Challenge - Milestone 2

**Submitted by: Hemant Gehlod**

**Date: March 23, 2025**

**Github: https://github.com/Hmtgit7/Digitalyz-Tech**

## Overview

This submission addresses the scheduling algorithm portion of the Smart Scheduling Challenge for Crestwood College. The implementation generates course schedules that aim to maximize the fulfillment of student requests while respecting all scheduling constraints.

## Approach

The scheduling algorithm follows a multi-phase approach:

### 1. Preprocessing Phase
- **Course Prioritization**: Courses are ranked based on a priority score calculated from the number and type of student requests (Required = 3 points, Requested = 2 points, Recommended = 1 point)
- **Constraint Analysis**: Creates a constraint matrix that tracks block availability, teacher conflicts, and room conflicts for each course

### 2. Initial Assignment Phase
- **Block Selection**: For each course (starting with highest priority), finds the most compatible block based on the constraint matrix
- **Section Creation**: Creates the specified number of sections for each course in its assigned block
- **Student Assignment**: Distributes students across sections based on request priority and section capacity

### 3. Optimization Phase
- Uses a simulated annealing approach to improve the initial schedule
- Identifies unresolved student requests and attempts to find alternative course placements
- Accepts or rejects moves based on their impact on the overall schedule quality

### 4. Output Generation Phase
- **Student View**: Creates a personalized schedule for each student showing their assigned courses and any unresolved requests
- **Teacher View**: Creates a block-by-block schedule for each teacher showing their assigned courses and sections
- **Statistics**: Calculates resolution rates by priority level and other key metrics

## Constraints Handled

The algorithm enforces several key constraints:

1. **Block Availability**: Courses are only scheduled in their available blocks
2. **Teacher Conflicts**: No teacher is assigned to multiple courses in the same block
3. **Room Conflicts**: No room is double-booked in the same block
4. **Section Sizes**: Student assignments respect minimum and maximum section sizes
5. **Request Priorities**: Required requests are prioritized over Requested and Recommended

## Implementation Details

The implementation is in JavaScript and consists of several key components:

- **Course Prioritization Logic**: Ranks courses based on demand and request priority
- **Constraint Matrix**: Tracks scheduling constraints for efficient assignment
- **Student Assignment**: Distributes students across sections while respecting capacity limits
- **Schedule Generation**: Creates formats suitable for students and teachers
- **Statistics Calculation**: Measures the quality of the generated schedule

## Results

The algorithm produces three main output files:

1. `student_schedules.json`: Contains each student's assigned courses and unresolved requests
2. `teacher_schedules.json`: Shows each teacher's teaching schedule by block
3. `scheduling_stats.json`: Provides metrics on request resolution rates

Key performance metrics:
- Overall resolution rate: ~91% of all requests
- Required request resolution rate: ~98% 
- Requested request resolution rate: ~92%
- Recommended request resolution rate: ~74%

## Future Improvements

Several enhancements could be made to the algorithm:

1. **More Sophisticated Optimization**: Implement a more advanced local search or constraint programming approach
2. **Multi-Term Planning**: Account for full-year courses and dependencies between terms
3. **Waitlist Management**: Track waitlists for oversubscribed courses
4. **Preference Weighting**: Consider additional student preferences beyond the three priority levels
5. **Visual Reporting**: Generate graphical reports of schedule quality and conflicts

## How to Run

1. Ensure the cleaned data from Milestone 1 is available
2. Install dependencies: `npm install fs path`
3. Run the scheduler: `node src/scheduler.js`
4. Check the output folder for the generated schedules and statistics

## File Structure

- `src/scheduler.js`: Main scheduling algorithm implementation
- `output/student_schedules.json`: Generated student schedules
- `output/teacher_schedules.json`: Generated teacher schedules
- `output/scheduling_stats.json`: Statistics on request resolution rates
- `docs/algorithm_approach.md`: Detailed algorithm design document