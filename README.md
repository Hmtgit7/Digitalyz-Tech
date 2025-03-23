# Smart Scheduling Challenge

## Project Overview

This project implements a smart course scheduling system for Crestwood College, designed to efficiently match student course requests with available resources (teachers, rooms, and time blocks). The challenge is divided into two main components:

1. **Data Cleaning & Structuring**: Transform raw Excel data into a well-structured JSON format.
2. **Scheduling Algorithm**: Create an optimal schedule that maximizes fulfilled student requests while respecting constraints.

## Problem Statement

Crestwood College needs to create a schedule that ensures students get their requested courses without conflicts. The scheduling team must consider:
- Student course requests with varying priority levels (Required, Requested, Recommended)
- Teacher availability and assignments
- Classroom availability and capacity
- Time block constraints
- Course section sizes and limits

The goal is to create a schedule that maximizes student satisfaction while adhering to all constraints.

## Repository Structure

```
.
├── milestone-1/              # Data Cleaning & Structuring
│   ├── README.md            # Milestone 1 documentation
│   ├── src/                 # Source code
│   │   └── clean_data.js    # Data cleaning implementation
│   ├── output/              # Generated files
│   │   └── cleaned_data.json# Cleaned and structured data
│   └── docs/
│       └── validation_report.md # Data quality issues and insights
│
└── milestone-2/              # Scheduling Algorithm
    ├── README.md            # Milestone 2 documentation
    ├── src/                 # Source code
    │   └── scheduler.js     # Scheduling algorithm implementation
    ├── output/              # Generated files
    │   ├── student_schedules.json # Student view of schedule
    │   ├── teacher_schedules.json # Teacher view of schedule
    │   └── scheduling_stats.json  # Schedule quality metrics
    └── docs/
        └── algorithm_approach.md  # Algorithm design document
```

## Milestone 1: Data Cleaning & Structuring

### Approach

The data cleaning phase involves:
1. Analyzing raw Excel data to understand structure and relationships
2. Transforming data into a consistent JSON format
3. Validating data and identifying quality issues
4. Generating insights to inform the scheduling algorithm

### Key Findings

- 156 students with 1,259 course requests (average 8.07 requests per student)
- 75 unique courses offered by 23 lecturers across 20 classrooms
- 62 requests (5%) are for courses not defined in the course catalog
- Several courses are oversubscribed (demand exceeds capacity)
- Request priorities: Required (14.14%), Requested (76.49%), Recommended (9.37%)

### Implementation

The data cleaning implementation:
- Reads an Excel file with lecturer, room, course, and student data
- Standardizes field names and data types
- Creates a structured JSON with clear relationships between entities
- Identifies and reports data quality issues

## Milestone 2: Scheduling Algorithm

### Approach

The scheduling algorithm follows a multi-phase approach:

1. **Preprocessing**: Prioritize courses and analyze constraints
2. **Initial Assignment**: Place courses in blocks using a greedy algorithm
3. **Iterative Optimization**: Improve the schedule using simulated annealing
4. **Results Generation**: Create student and teacher schedule views

### Constraints Handled

The algorithm enforces several key constraints:
1. No teacher can be present twice in the same block
2. No student can be present twice in the same block
3. Courses can only be scheduled in their available blocks
4. Sections should not exceed maximum capacity
5. Sections should be balanced in size when possible

### Results

The scheduling algorithm produces:
- Student schedules with assigned courses and unresolved requests
- Teacher schedules showing courses, rooms, and student counts by block
- Statistics on request resolution rates by priority level
- Overall resolution rate of approximately 91%

## How to Run

### Milestone 1
```bash
cd milestone-1
npm install xlsx fs path
node src/clean_data.js
```

### Milestone 2
```bash
cd milestone-2
npm install fs path
node src/scheduler.js
```

## Future Improvements

Potential enhancements to the system:
1. More sophisticated optimization techniques
2. Multi-term planning capabilities
3. Waitlist management for oversubscribed courses
4. Visual reporting of schedule quality
5. Interactive adjustment capabilities

## Technologies Used

- JavaScript/Node.js
- Excel parsing (xlsx library)
- JSON for data storage
- Constraint satisfaction techniques
- Simulated annealing for optimization