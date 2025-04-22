export const GRADE_LEVELS = ["Freshman", "Sophomore", "Junior", "Senior"];
export const TERMS = ["Fall", "Winter", "Spring", "Summer"];
export const COURSE_LEVELS = ["Regular", "Honors", "AP", "IB", "Dual Enrollment", "College"];
export const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
export const CREDITS_OPTIONS = [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0];
export const SCHOOL_YEARS = [
  "2024-2025", "2023-2024", "2022-2023", "2021-2022", "2020-2021",
  "2019-2020", "2018-2019", "2017-2018", "2016-2017", "2015-2016"
];

export interface CourseTemplate {
  name: string;
  credits: number;
  level: string;
  isSelected?: boolean;
}

export interface CourseGroup {
  [category: string]: CourseTemplate[];
}

// Comprehensive list of common high school courses organized by subject
export const COMMON_COURSES: CourseGroup = {
  "English": [
    { name: "English 9", credits: 1.0, level: "Regular" },
    { name: "English 10", credits: 1.0, level: "Regular" },
    { name: "English 11", credits: 1.0, level: "Regular" },
    { name: "English 12", credits: 1.0, level: "Regular" },
    { name: "Honors English 9", credits: 1.0, level: "Honors" },
    { name: "Honors English 10", credits: 1.0, level: "Honors" },
    { name: "Honors English 11", credits: 1.0, level: "Honors" },
    { name: "Honors English 12", credits: 1.0, level: "Honors" },
    { name: "AP English Language and Composition", credits: 1.0, level: "AP" },
    { name: "AP English Literature and Composition", credits: 1.0, level: "AP" },
    { name: "IB English A: Literature HL", credits: 1.0, level: "IB" },
    { name: "IB English A: Language and Literature HL", credits: 1.0, level: "IB" },
    { name: "Creative Writing", credits: 0.5, level: "Regular" },
    { name: "Journalism", credits: 0.5, level: "Regular" },
    { name: "Speech and Debate", credits: 0.5, level: "Regular" },
    { name: "Public Speaking", credits: 0.5, level: "Regular" }
  ],
  "Mathematics": [
    { name: "Algebra 1", credits: 1.0, level: "Regular" },
    { name: "Geometry", credits: 1.0, level: "Regular" },
    { name: "Algebra 2", credits: 1.0, level: "Regular" },
    { name: "Pre-Calculus", credits: 1.0, level: "Regular" },
    { name: "Calculus", credits: 1.0, level: "Regular" },
    { name: "Honors Algebra 1", credits: 1.0, level: "Honors" },
    { name: "Honors Geometry", credits: 1.0, level: "Honors" },
    { name: "Honors Algebra 2", credits: 1.0, level: "Honors" },
    { name: "Honors Pre-Calculus", credits: 1.0, level: "Honors" },
    { name: "AP Calculus AB", credits: 1.0, level: "AP" },
    { name: "AP Calculus BC", credits: 1.0, level: "AP" },
    { name: "AP Statistics", credits: 1.0, level: "AP" },
    { name: "IB Mathematics: Analysis and Approaches SL", credits: 1.0, level: "IB" },
    { name: "IB Mathematics: Analysis and Approaches HL", credits: 1.0, level: "IB" },
    { name: "IB Mathematics: Applications and Interpretation SL", credits: 1.0, level: "IB" },
    { name: "IB Mathematics: Applications and Interpretation HL", credits: 1.0, level: "IB" },
    { name: "Statistics", credits: 1.0, level: "Regular" },
    { name: "Trigonometry", credits: 0.5, level: "Regular" },
    { name: "Finite Mathematics", credits: 1.0, level: "Regular" },
    { name: "Multivariable Calculus", credits: 1.0, level: "College" },
    { name: "Linear Algebra", credits: 1.0, level: "College" },
    { name: "Differential Equations", credits: 1.0, level: "College" }
  ],
  "Science": [
    { name: "Biology", credits: 1.0, level: "Regular" },
    { name: "Chemistry", credits: 1.0, level: "Regular" },
    { name: "Physics", credits: 1.0, level: "Regular" },
    { name: "Earth Science", credits: 1.0, level: "Regular" },
    { name: "Environmental Science", credits: 1.0, level: "Regular" },
    { name: "Anatomy and Physiology", credits: 1.0, level: "Regular" },
    { name: "Honors Biology", credits: 1.0, level: "Honors" },
    { name: "Honors Chemistry", credits: 1.0, level: "Honors" },
    { name: "Honors Physics", credits: 1.0, level: "Honors" },
    { name: "AP Biology", credits: 1.0, level: "AP" },
    { name: "AP Chemistry", credits: 1.0, level: "AP" },
    { name: "AP Physics 1", credits: 1.0, level: "AP" },
    { name: "AP Physics 2", credits: 1.0, level: "AP" },
    { name: "AP Physics C: Mechanics", credits: 1.0, level: "AP" },
    { name: "AP Physics C: Electricity and Magnetism", credits: 1.0, level: "AP" },
    { name: "AP Environmental Science", credits: 1.0, level: "AP" },
    { name: "IB Biology HL", credits: 1.0, level: "IB" },
    { name: "IB Chemistry HL", credits: 1.0, level: "IB" },
    { name: "IB Physics HL", credits: 1.0, level: "IB" },
    { name: "Forensic Science", credits: 0.5, level: "Regular" },
    { name: "Astronomy", credits: 0.5, level: "Regular" },
    { name: "Marine Biology", credits: 0.5, level: "Regular" },
    { name: "Zoology", credits: 0.5, level: "Regular" },
    { name: "Botany", credits: 0.5, level: "Regular" }
  ],
  "Social Studies": [
    { name: "World History", credits: 1.0, level: "Regular" },
    { name: "U.S. History", credits: 1.0, level: "Regular" },
    { name: "U.S. Government", credits: 0.5, level: "Regular" },
    { name: "Economics", credits: 0.5, level: "Regular" },
    { name: "Geography", credits: 0.5, level: "Regular" },
    { name: "Psychology", credits: 0.5, level: "Regular" },
    { name: "Sociology", credits: 0.5, level: "Regular" },
    { name: "Honors World History", credits: 1.0, level: "Honors" },
    { name: "Honors U.S. History", credits: 1.0, level: "Honors" },
    { name: "AP World History", credits: 1.0, level: "AP" },
    { name: "AP U.S. History", credits: 1.0, level: "AP" },
    { name: "AP U.S. Government and Politics", credits: 1.0, level: "AP" },
    { name: "AP Comparative Government and Politics", credits: 1.0, level: "AP" },
    { name: "AP Human Geography", credits: 1.0, level: "AP" },
    { name: "AP Psychology", credits: 1.0, level: "AP" },
    { name: "AP Macroeconomics", credits: 0.5, level: "AP" },
    { name: "AP Microeconomics", credits: 0.5, level: "AP" },
    { name: "IB History HL", credits: 1.0, level: "IB" },
    { name: "IB Psychology SL/HL", credits: 1.0, level: "IB" },
    { name: "IB Global Politics SL/HL", credits: 1.0, level: "IB" },
    { name: "Philosophy", credits: 0.5, level: "Regular" },
    { name: "Anthropology", credits: 0.5, level: "Regular" },
    { name: "Political Science", credits: 0.5, level: "Regular" },
    { name: "Current Events", credits: 0.5, level: "Regular" }
  ],
  "World Languages": [
    { name: "Spanish 1", credits: 1.0, level: "Regular" },
    { name: "Spanish 2", credits: 1.0, level: "Regular" },
    { name: "Spanish 3", credits: 1.0, level: "Regular" },
    { name: "Spanish 4", credits: 1.0, level: "Regular" },
    { name: "AP Spanish Language and Culture", credits: 1.0, level: "AP" },
    { name: "AP Spanish Literature and Culture", credits: 1.0, level: "AP" },
    { name: "IB Spanish B SL/HL", credits: 1.0, level: "IB" },
    { name: "French 1", credits: 1.0, level: "Regular" },
    { name: "French 2", credits: 1.0, level: "Regular" },
    { name: "French 3", credits: 1.0, level: "Regular" },
    { name: "French 4", credits: 1.0, level: "Regular" },
    { name: "AP French Language and Culture", credits: 1.0, level: "AP" },
    { name: "IB French B SL/HL", credits: 1.0, level: "IB" },
    { name: "German 1", credits: 1.0, level: "Regular" },
    { name: "German 2", credits: 1.0, level: "Regular" },
    { name: "German 3", credits: 1.0, level: "Regular" },
    { name: "German 4", credits: 1.0, level: "Regular" },
    { name: "AP German Language and Culture", credits: 1.0, level: "AP" },
    { name: "IB German B SL/HL", credits: 1.0, level: "IB" },
    { name: "Mandarin Chinese 1", credits: 1.0, level: "Regular" },
    { name: "Mandarin Chinese 2", credits: 1.0, level: "Regular" },
    { name: "Mandarin Chinese 3", credits: 1.0, level: "Regular" },
    { name: "Mandarin Chinese 4", credits: 1.0, level: "Regular" },
    { name: "AP Chinese Language and Culture", credits: 1.0, level: "AP" },
    { name: "IB Mandarin B SL/HL", credits: 1.0, level: "IB" },
    { name: "Latin 1", credits: 1.0, level: "Regular" },
    { name: "Latin 2", credits: 1.0, level: "Regular" },
    { name: "Latin 3", credits: 1.0, level: "Regular" },
    { name: "Latin 4", credits: 1.0, level: "Regular" },
    { name: "AP Latin", credits: 1.0, level: "AP" },
    { name: "Japanese 1", credits: 1.0, level: "Regular" },
    { name: "Japanese 2", credits: 1.0, level: "Regular" },
    { name: "Japanese 3", credits: 1.0, level: "Regular" },
    { name: "Japanese 4", credits: 1.0, level: "Regular" },
    { name: "AP Japanese Language and Culture", credits: 1.0, level: "AP" }
  ],
  "Arts": [
    { name: "Art 1", credits: 1.0, level: "Regular" },
    { name: "Art 2", credits: 1.0, level: "Regular" },
    { name: "Drawing and Painting", credits: 0.5, level: "Regular" },
    { name: "Ceramics", credits: 0.5, level: "Regular" },
    { name: "Sculpture", credits: 0.5, level: "Regular" },
    { name: "Photography", credits: 0.5, level: "Regular" },
    { name: "Digital Media", credits: 0.5, level: "Regular" },
    { name: "Film Production", credits: 0.5, level: "Regular" },
    { name: "Graphic Design", credits: 0.5, level: "Regular" },
    { name: "AP Studio Art: 2-D Design", credits: 1.0, level: "AP" },
    { name: "AP Studio Art: 3-D Design", credits: 1.0, level: "AP" },
    { name: "AP Studio Art: Drawing", credits: 1.0, level: "AP" },
    { name: "AP Art History", credits: 1.0, level: "AP" },
    { name: "IB Visual Arts SL/HL", credits: 1.0, level: "IB" },
    { name: "Band", credits: 1.0, level: "Regular" },
    { name: "Orchestra", credits: 1.0, level: "Regular" },
    { name: "Jazz Band", credits: 0.5, level: "Regular" },
    { name: "Choir", credits: 1.0, level: "Regular" },
    { name: "Music Theory", credits: 0.5, level: "Regular" },
    { name: "AP Music Theory", credits: 1.0, level: "AP" },
    { name: "IB Music SL/HL", credits: 1.0, level: "IB" },
    { name: "Theater Arts", credits: 0.5, level: "Regular" },
    { name: "Drama", credits: 0.5, level: "Regular" },
    { name: "Technical Theater", credits: 0.5, level: "Regular" },
    { name: "Dance", credits: 0.5, level: "Regular" }
  ],
  "Computer Science": [
    { name: "Computer Science Principles", credits: 0.5, level: "Regular" },
    { name: "Computer Programming", credits: 0.5, level: "Regular" },
    { name: "Web Design", credits: 0.5, level: "Regular" },
    { name: "Game Development", credits: 0.5, level: "Regular" },
    { name: "Robotics", credits: 0.5, level: "Regular" },
    { name: "AP Computer Science Principles", credits: 1.0, level: "AP" },
    { name: "AP Computer Science A", credits: 1.0, level: "AP" },
    { name: "IB Computer Science SL/HL", credits: 1.0, level: "IB" },
    { name: "Cybersecurity", credits: 0.5, level: "Regular" },
    { name: "Mobile App Development", credits: 0.5, level: "Regular" },
    { name: "Artificial Intelligence", credits: 0.5, level: "Regular" },
    { name: "Data Science", credits: 0.5, level: "Regular" }
  ],
  "Physical Education & Health": [
    { name: "Physical Education", credits: 0.5, level: "Regular" },
    { name: "Health", credits: 0.5, level: "Regular" },
    { name: "Weight Training", credits: 0.5, level: "Regular" },
    { name: "Team Sports", credits: 0.5, level: "Regular" },
    { name: "Individual Sports", credits: 0.5, level: "Regular" },
    { name: "Fitness for Life", credits: 0.5, level: "Regular" },
    { name: "Swimming", credits: 0.5, level: "Regular" },
    { name: "Dance Fitness", credits: 0.5, level: "Regular" },
    { name: "Nutrition", credits: 0.5, level: "Regular" },
    { name: "Sports Medicine", credits: 0.5, level: "Regular" },
    { name: "Yoga", credits: 0.5, level: "Regular" },
    { name: "First Aid and CPR", credits: 0.5, level: "Regular" }
  ],
  "Career & Technical Education": [
    { name: "Business Management", credits: 0.5, level: "Regular" },
    { name: "Marketing", credits: 0.5, level: "Regular" },
    { name: "Accounting", credits: 0.5, level: "Regular" },
    { name: "Personal Finance", credits: 0.5, level: "Regular" },
    { name: "Entrepreneurship", credits: 0.5, level: "Regular" },
    { name: "Introduction to Engineering Design", credits: 1.0, level: "Regular" },
    { name: "Principles of Engineering", credits: 1.0, level: "Regular" },
    { name: "Digital Electronics", credits: 1.0, level: "Regular" },
    { name: "Aerospace Engineering", credits: 1.0, level: "Regular" },
    { name: "Civil Engineering and Architecture", credits: 1.0, level: "Regular" },
    { name: "Computer Integrated Manufacturing", credits: 1.0, level: "Regular" },
    { name: "Engineering Design and Development", credits: 1.0, level: "Regular" },
    { name: "Culinary Arts", credits: 0.5, level: "Regular" },
    { name: "Fashion Design", credits: 0.5, level: "Regular" },
    { name: "Interior Design", credits: 0.5, level: "Regular" },
    { name: "Child Development", credits: 0.5, level: "Regular" },
    { name: "Automotive Technology", credits: 1.0, level: "Regular" },
    { name: "Woodworking", credits: 0.5, level: "Regular" },
    { name: "Metalworking", credits: 0.5, level: "Regular" },
    { name: "Construction Technology", credits: 0.5, level: "Regular" },
    { name: "Healthcare Foundations", credits: 0.5, level: "Regular" },
    { name: "Medical Terminology", credits: 0.5, level: "Regular" }
  ],
  "Other Electives": [
    { name: "Study Hall", credits: 0.0, level: "Regular" },
    { name: "Teacher Assistant", credits: 0.5, level: "Regular" },
    { name: "Student Leadership", credits: 0.5, level: "Regular" },
    { name: "Yearbook", credits: 1.0, level: "Regular" },
    { name: "Peer Tutoring", credits: 0.5, level: "Regular" },
    { name: "Community Service", credits: 0.5, level: "Regular" },
    { name: "Independent Study", credits: 0.5, level: "Regular" },
    { name: "College and Career Readiness", credits: 0.5, level: "Regular" },
    { name: "SAT/ACT Prep", credits: 0.5, level: "Regular" },
    { name: "Research Methods", credits: 0.5, level: "Regular" },
    { name: "Critical Thinking", credits: 0.5, level: "Regular" },
    { name: "Media Literacy", credits: 0.5, level: "Regular" }
  ]
};

// Helper function to add isSelected property to all courses
export function initializeCoursesWithSelection(courses: CourseGroup): CourseGroup {
  const result: CourseGroup = {};
  
  for (const category in courses) {
    result[category] = courses[category].map(course => ({
      ...course,
      isSelected: false
    }));
  }
  
  return result;
} 