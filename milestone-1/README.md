# Smart Scheduling Challenge - Milestone 1

**Submitted by: Hemant Gehlod**

**Date: March 23, 2025**

**Github: https://github.com/Hmtgit7/Digitalyz-Tech**

## Overview
This submission tackles the data cleaning and structuring portion of the Smart Scheduling Challenge. The goal is to transform raw Excel data from Crestwood College into a well-structured JSON format suitable for scheduling algorithm development.

## Approach
1. **Data Analysis**: Analyzed the raw Excel data to understand its structure, relationships, and quality issues.
2. **Data Cleaning**: Implemented a JavaScript solution to clean and transform the data.
3. **Validation**: Performed validation checks to identify issues like missing courses, oversubscribed sections, and room assignment inconsistencies.
4. **Insights Generation**: Generated insights from the data to inform the scheduling algorithm design.

## Implementation
- The cleaning logic is implemented in `src/clean_data.js`
- The script reads the Excel file, cleans the data, and generates a structured JSON file
- All data relationships are preserved and enhanced in the JSON structure

## Findings
The data analysis revealed several key insights:
- 156 students with 1,259 course requests (avg. 8.07 requests per student)
- 75 unique courses offered by 23 lecturers across 20 classrooms
- 62 requests (5%) are for courses not defined in the course catalog
- Several courses are oversubscribed (demand exceeds capacity)
- Request priorities: Required (14%), Requested (76%), Recommended (9%)

## Data Structure
The cleaned data follows this JSON structure:
```json
{
  "metadata": {
    "totalStudents": 156,
    "totalLecturers": 23,
    "totalCourses": 75,
    "totalRooms": 20,
    "totalRequests": 1259,
    "blocks": ["1A", "1B", "2A", "2B", "3", "4A", "4B"],
    "requestTypes": ["Required", "Requested", "Recommended"]
  },
  "courses": [
    {
      "courseCode": "ARTBND",
      "title": "Band - High",
      "length": 2,
      "priority": "Core course",
      "availableBlocks": ["1A", "1B", "2A", "2B", "3", "4A", "4B"],
      "unavailableBlocks": [],
      "sectionSizes": {
        "min": 7,
        "target": 25,
        "max": 40
      },
      "numberOfSections": 1,
      "totalCredits": 1,
      "assignedRooms": [133],
      "lecturerIds": [5361519]
    }
  ],
  "lecturers": [...],
  "rooms": [...],
  "students": [...],
  "validation": {...}
}
```

## File Structure
- `src/clean_data.js`: Data cleaning implementation
- `output/cleaned_data.json`: Structured output data
- `docs/validation_report.md`: Detailed validation issues and insights

## How to Run
1. Install dependencies: `npm install xlsx fs path`
2. Run the script: `node src/clean_data.js`
3. Output will be generated in the `output` folder