// types/academic.ts

export interface Course {
  id: string;
  courseId: string;
  courseName: string;
  degree: string;
}

export interface Department {
  id: string;
  departmentId: string;
  name: string;
  courses: Course[];
}

export interface Campus {
  id: string;
  campusId: string;
  campusName: string;
  departments: Department[];
}

// Hardcoded academic data
export const campusesData: Campus[] = [
  {
    id: "1",
    campusId: "CAU",
    campusName: "Carlos Hilado Memorial State University - Talisay",
    departments: [
      {
        id: "d1",
        departmentId: "CCS",
        name: "College of Computer Studies",
        courses: [
          {
            id: "c1",
            courseId: "BSIT",
            courseName: "Bachelor of Science in Information Technology",
            degree: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY",
          },
          {
            id: "c2",
            courseId: "BSCS",
            courseName: "Bachelor of Science in Computer Science",
            degree: "BACHELOR OF SCIENCE IN COMPUTER SCIENCE",
          },
          {
            id: "c3",
            courseId: "BSIS",
            courseName: "Bachelor of Science in Information Systems",
            degree: "BACHELOR OF SCIENCE IN INFORMATION SYSTEMS",
          },
        ],
      },
      {
        id: "d2",
        departmentId: "CBA",
        name: "College of Business and Accountancy",
        courses: [
          {
            id: "c4",
            courseId: "BSA",
            courseName: "Bachelor of Science in Accountancy",
            degree: "BACHELOR OF SCIENCE IN ACCOUNTANCY",
          },
          {
            id: "c5",
            courseId: "BSBA",
            courseName: "Bachelor of Science in Business Administration",
            degree: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION",
          },
        ],
      },
      {
        id: "d3",
        departmentId: "COE",
        name: "College of Engineering",
        courses: [
          {
            id: "c6",
            courseId: "BSCE",
            courseName: "Bachelor of Science in Civil Engineering",
            degree: "BACHELOR OF SCIENCE IN CIVIL ENGINEERING",
          },
          {
            id: "c7",
            courseId: "BSEE",
            courseName: "Bachelor of Science in Electrical Engineering",
            degree: "BACHELOR OF SCIENCE IN ELECTRICAL ENGINEERING",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    campusId: "CBU",
    campusName: "Carlos Hilado Memorial State University - Binalbagan",
    departments: [
      {
        id: "d4",
        departmentId: "CTE",
        name: "College of Teacher Education",
        courses: [
          {
            id: "c8",
            courseId: "BEEd",
            courseName: "Bachelor of Elementary Education",
            degree: "BACHELOR OF ELEMENTARY EDUCATION",
          },
          {
            id: "c9",
            courseId: "BSEd",
            courseName: "Bachelor of Secondary Education",
            degree: "BACHELOR OF SECONDARY EDUCATION",
          },
        ],
      },
      {
        id: "d5",
        departmentId: "CN",
        name: "College of Nursing",
        courses: [
          {
            id: "c10",
            courseId: "BSN",
            courseName: "Bachelor of Science in Nursing",
            degree: "BACHELOR OF SCIENCE IN NURSING",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    campusId: "CSU",
    campusName: "Carlos Hilado Memorial State University - Fortune Towne",
    departments: [
      {
        id: "d6",
        departmentId: "CHS",
        name: "College of Hospitality Studies",
        courses: [
          {
            id: "c11",
            courseId: "BSHM",
            courseName: "Bachelor of Science in Hospitality Management",
            degree: "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT",
          },
        ],
      },
      {
        id: "d7",
        departmentId: "CA",
        name: "College of Arts and Sciences",
        courses: [
          {
            id: "c12",
            courseId: "BAP",
            courseName: "Bachelor of Arts in Psychology",
            degree: "BACHELOR OF ARTS IN PSYCHOLOGY",
          },
        ],
      },
    ],
  },
];

// Helper functions
export function getDepartmentsByCampusId(campusId: string): Department[] {
  const campus = campusesData.find(
    (c) => c.id === campusId || c.campusId === campusId,
  );
  return campus ? campus.departments : [];
}

export function getCoursesByDepartmentId(departmentId: string): Course[] {
  // Search through all campuses
  for (const campus of campusesData) {
    const department = campus.departments.find(
      (d) => d.id === departmentId || d.departmentId === departmentId,
    );
    if (department) {
      return department.courses;
    }
  }
  return [];
}

// Get all campuses (for initial dropdown)
export function getAllCampuses(): Campus[] {
  return campusesData;
}
