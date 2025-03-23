# Scheduling Algorithm Approach - Milestone 2

## Introduction

This document outlines the approach for developing a scheduling algorithm to address the Crestwood College scheduling challenge. The goal is to create a schedule that maximizes the fulfillment of student course requests while adhering to the constraints specified in the RULES sheet.

## Problem Definition

### Objective
Create a schedule that:
1. Maximizes the number of fulfilled student requests
2. Respects priority levels (Required > Requested > Recommended)
3. Follows all specified constraints

### Constraints
1. No teacher can be present twice in the same block
2. No student can be present twice in the same block
3. Courses can only be scheduled in their available blocks
4. Sections should not exceed maximum capacity
5. Sections should be balanced in size when possible
6. Room assignments must be respected

## Algorithm Design

### High-Level Approach

We will implement a **constraint satisfaction algorithm** with **priority-based optimization**. The algorithm will work in phases:

1. **Preprocessing**: Prepare the data structures and identify critical constraints
2. **Initial Assignment**: Place courses in blocks based on hard constraints
3. **Iterative Optimization**: Improve the schedule by resolving conflicts
4. **Results Generation**: Create views for students and teachers

### Phase 1: Preprocessing

1. **Request Prioritization**:
   - Group requests by priority level (Required, Requested, Recommended)
   - Within each level, identify courses with limited availability or high demand
   
2. **Constraint Analysis**:
   - Identify "bottleneck" courses (high-demand, limited sections)
   - Analyze teacher and room availability constraints
   - Create a dependency graph between courses based on common student requests

3. **Initial Block Compatibility Matrix**:
   - For each course, create a compatibility score for each block
   - Consider available blocks, room constraints, and teacher availability

### Phase 2: Initial Assignment

We will use a **greedy algorithm** with **constraint propagation** for initial placement:

1. Sort courses by:
   - Number of Required requests
   - Limited block availability
   - High demand-to-capacity ratio

2. For each course:
   - Assign to the most compatible block
   - Update constraints for dependent courses
   - If no valid block exists, mark for resolution in the optimization phase

3. For each course section:
   - Assign students based on priority
   - If oversubscribed, use priority levels to determine assignments
   - Keep track of unresolved requests

### Phase 3: Iterative Optimization

We will use a **local search with simulated annealing** approach:

1. Define a cost function that considers:
   - Number of unresolved requests (weighted by priority)
   - Section size balance
   - Room utilization efficiency

2. In each iteration:
   - Select a course with unresolved requests
   - Try alternative block assignments
   - Accept changes that improve the cost function
   - Occasionally accept worse solutions to escape local optima

3. Continue until:
   - A maximum number of iterations is reached
   - No further improvements are found after several iterations
   - A target resolution percentage is achieved

### Phase 4: Results Generation

1. **Student View**:
   - For each student, generate a schedule showing:
     - Assigned courses and sections
     - Block and room information
     - Unresolved requests (if any)

2. **Teacher View**:
   - For each teacher, generate a schedule showing:
     - Assigned courses and sections
     - Blocks and rooms
     - Student counts

3. **Statistics Generation**:
   - Resolution percentages by priority level
   - Distribution of section sizes
   - Block utilization metrics

## Implementation Plan

### Data Structures

1. **Course Assignment Map**:
   ```javascript
   {
     courseCode: {
       sections: [
         {
           sectionNumber: 1,
           block: "1A",
           room: 133,
           lecturer: 5361519,
           students: [5407488, 5407489, ...],
           capacity: {min: 7, target: 25, max: 40}
         }
       ]
     }
   }
   ```

2. **Student Schedule Map**:
   ```javascript
   {
     studentId: {
       assignedCourses: [
         {
           courseCode: "ARTBND",
           title: "Band - High",
           block: "1A",
           room: 133,
           sectionNumber: 1,
           type: "Requested" // Original request type
         }
       ],
       unresolvedRequests: [
         {
           courseCode: "TECHDIGIT",
           title: "Digital Imaging & Editing",
           type: "Requested",
           reason: "Capacity exceeded"
         }
       ]
     }
   }
   ```

3. **Teacher Schedule Map**:
   ```javascript
   {
     teacherId: {
       blocks: {
         "1A": {
           courseCode: "ARTBND",
           title: "Band - High",
           room: 133,
           studentCount: 22
         },
         "2B": {
           courseCode: "ARTMBAND",
           title: "Middle  Band",
           room: 133,
           studentCount: 18
         }
       }
     }
   }
   ```

### Algorithm Implementation

The core scheduling function follows this pseudocode:

```
function generateSchedule(cleanedData):
  // Initialize data structures
  courseAssignments = {}
  studentSchedules = {}
  teacherSchedules = {}
  
  // Phase 1: Preprocessing
  prioritizedCourses = prioritizeCourses(cleanedData)
  constraintMatrix = analyzeConstraints(cleanedData)
  
  // Phase 2: Initial Assignment
  foreach course in prioritizedCourses:
    bestBlock = findBestBlock(course, constraintMatrix)
    initialAssignment(course, bestBlock, courseAssignments)
    updateConstraints(constraintMatrix, course, bestBlock)
  
  // Phase 3: Optimization
  for i = 1 to MAX_ITERATIONS:
    unresolvedRequest = selectUnresolvedRequest()
    if none exist or stopping condition:
      break
      
    candidateMove = generateCandidateMove(unresolvedRequest)
    delta = evaluateMove(candidateMove)
    
    if acceptMove(delta, temperature(i)):
      applyMove(candidateMove)
      updateAssignments()
  
  // Phase 4: Generate Views
  studentSchedules = generateStudentSchedules(courseAssignments)
  teacherSchedules = generateTeacherSchedules(courseAssignments)
  statistics = calculateStatistics(courseAssignments)
  
  return {
    courseAssignments,
    studentSchedules,
    teacherSchedules,
    statistics
  }
```

## Testing and Evaluation Approach

### Testing Strategy

1. **Unit Testing**:
   - Test individual algorithm components (constraint checking, assignment logic)
   - Verify correctness of data transformations

2. **Integration Testing**:
   - Test the entire scheduling pipeline with sample data
   - Verify that all components work together correctly

3. **Validation Testing**:
   - Verify that the generated schedule meets all constraints
   - Check for rule violations (teacher conflicts, student conflicts)

### Evaluation Metrics

To measure the quality of our scheduling solution, we'll use the following metrics:

1. **Request Resolution Rate**:
   - Overall percentage of resolved requests
   - Resolution rates by priority (Required, Requested, Recommended)
   - Resolution rates by department and year

2. **Section Balance**:
   - Average deviation from target section size
   - Number of under-enrolled sections (below minimum)
   - Number of over-enrolled sections (above maximum)

3. **Resource Utilization**:
   - Room utilization percentage across blocks
   - Teacher load distribution
   - Block utilization patterns

4. **Constraint Satisfaction**:
   - Number of teacher conflicts
   - Number of student conflicts
   - Number of room assignment violations

## Potential Challenges and Mitigation Strategies

### Challenge 1: Oversubscribed Courses
**Mitigation**: Implement a fair allocation system based on priority and potentially add a waitlist feature to track unresolved high-priority requests.

### Challenge 2: Complex Constraint Interactions
**Mitigation**: Use constraint propagation techniques to immediately update the feasible assignment space when decisions are made.

### Challenge 3: Performance with Large Datasets
**Mitigation**: Implement efficient data structures and consider using heuristics to guide the search rather than exhaustive evaluation.

### Challenge 4: Unsatisfiable Constraints
**Mitigation**: Implement a soft constraint system that allows for some flexibility while prioritizing critical constraints.

## Conclusion

This scheduling approach balances complexity with effectiveness, focusing on:

1. **Prioritizing student needs** by resolving high-priority requests first
2. **Respecting all constraints** specified in the rules
3. **Optimizing resource utilization** across rooms and teachers
4. **Providing clear visibility** through student and teacher schedule views

The implementation will be developed incrementally, starting with core functionality and adding optimization features as we progress. The evaluation metrics will help us measure the quality of our solution and identify areas for improvement.

Even if we don't achieve 100% resolution of all requests, the algorithm will prioritize the most important requests and provide clear information about any unresolved requests, helping the scheduling team make informed decisions about exceptions or adjustments.