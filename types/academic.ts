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
    campusId: "TAL",
    campusName: "Carlos Hilado Memorial State University - Talisay",
    departments: [
      {
        id: "d1",
        departmentId: "CAS",
        name: "College of Arts and Sciences",
        courses: [
          {
            id: "c1",
            courseId: "BA-ENG",
            courseName: "Bachelor of Arts in English Language",
            degree: "BACHELOR OF ARTS IN ENGLISH LANGUAGE",
          },
          {
            id: "c2",
            courseId: "BA-SOCSCI",
            courseName: "Bachelor of Arts in Social Science",
            degree: "BACHELOR OF ARTS IN SOCIAL SCIENCE",
          },
          {
            id: "c3",
            courseId: "BA-ADMIN",
            courseName: "Bachelor of Arts in Administration",
            degree: "BACHELOR OF ARTS IN ADMINISTRATION",
          },
          {
            id: "c4",
            courseId: "BA-APMATH",
            courseName: "Bachelor of Arts in Applied Mathematics",
            degree: "BACHELOR OF ARTS IN APPLIED MATHEMATICS",
          },
          {
            id: "c5",
            courseId: "BA-PSYCH",
            courseName: "Bachelor of Arts in Psychology",
            degree: "BACHELOR OF ARTS IN PSYCHOLOGY",
          },
          {
            id: "c6",
            courseId: "MPA",
            courseName: "Master in Public Administration",
            degree: "MASTER IN PUBLIC ADMINISTRATION",
          },
        ],
      },
      {
        id: "d2",
        departmentId: "CIT",
        name: "College of Industrial Technology",
        courses: [
          {
            id: "c7",
            courseId: "BSIT-AFT",
            courseName:
              "Bachelor of Science in Industrial Technology major in Apparel and Fashion Technology",
            degree: "BACHELOR OF SCIENCE IN INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c8",
            courseId: "BSIT-ADT",
            courseName:
              "Bachelor of Science in Industrial Technology major in Architectural Drafting Technology",
            degree: "BACHELOR OF SCIENCE IN INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c9",
            courseId: "BSIT-AT",
            courseName:
              "Bachelor of Science in Industrial Technology major in Automotive Technology",
            degree: "BACHELOR OF SCIENCE IN INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c10",
            courseId: "BSIT-CT",
            courseName:
              "Bachelor of Science in Industrial Technology major in Culinary Technology",
            degree: "BACHELOR OF SCIENCE IN INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c11",
            courseId: "BSIT-ET",
            courseName:
              "Bachelor of Science in Industrial Technology major in Electrical Technology",
            degree: "BACHELOR OF SCIENCE IN INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c12",
            courseId: "BSIT-MT",
            courseName:
              "Bachelor of Science in Industrial Technology major in Mechanical Technology",
            degree: "BACHELOR OF SCIENCE IN INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c13",
            courseId: "BSIT-ELT",
            courseName:
              "Bachelor of Science in Industrial Technology major in Electronics Technology",
            degree: "BACHELOR OF SCIENCE IN INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c14",
            courseId: "BSIT-HVAC",
            courseName:
              "Bachelor of Science in Industrial Technology major in Heating Ventilating Air Conditioning and Refrigeration Technology",
            degree: "BACHELOR OF SCIENCE IN INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c15",
            courseId: "MTM",
            courseName: "Master in Technology Management",
            degree: "MASTER IN TECHNOLOGY MANAGEMENT",
          },
          {
            id: "c16",
            courseId: "PHD-TM",
            courseName: "Doctor of Philosophy in Technology Management",
            degree: "DOCTOR OF PHILOSOPHY IN TECHNOLOGY MANAGEMENT",
          },
        ],
      },
      {
        id: "d3",
        departmentId: "COED",
        name: "College of Education",
        courses: [
          {
            id: "c17",
            courseId: "BECE",
            courseName: "Bachelor of Early Childhood Education",
            degree: "BACHELOR OF EARLY CHILDHOOD EDUCATION",
          },
          {
            id: "c18",
            courseId: "BEEd",
            courseName: "Bachelor of Elementary Education",
            degree: "BACHELOR OF ELEMENTARY EDUCATION",
          },
          {
            id: "c19",
            courseId: "BPE",
            courseName: "Bachelor of Physical Education",
            degree: "BACHELOR OF PHYSICAL EDUCATION",
          },
          {
            id: "c20",
            courseId: "BSEd-FIL",
            courseName: "Bachelor of Secondary Education major in Filipino",
            degree: "BACHELOR OF SECONDARY EDUCATION",
          },
          {
            id: "c21",
            courseId: "BSEd-ENG",
            courseName: "Bachelor of Secondary Education major in English",
            degree: "BACHELOR OF SECONDARY EDUCATION",
          },
          {
            id: "c22",
            courseId: "BSEd-MATH",
            courseName: "Bachelor of Secondary Education major in Mathematics",
            degree: "BACHELOR OF SECONDARY EDUCATION",
          },
          {
            id: "c23",
            courseId: "BSEd-SCI",
            courseName: "Bachelor of Secondary Education major in Science",
            degree: "BACHELOR OF SECONDARY EDUCATION",
          },
          {
            id: "c24",
            courseId: "BSNEd",
            courseName: "Bachelor of Special Needs Education",
            degree: "BACHELOR OF SPECIAL NEEDS EDUCATION",
          },
          {
            id: "c25",
            courseId: "BTLE-HE",
            courseName:
              "Bachelor of Technology in Livelihood Education major in Home Economics",
            degree: "BACHELOR OF TECHNOLOGY IN LIVELIHOOD EDUCATION",
          },
          {
            id: "c26",
            courseId: "BTLE-IA",
            courseName:
              "Bachelor of Technology in Livelihood Education major in Industrial Arts",
            degree: "BACHELOR OF TECHNOLOGY IN LIVELIHOOD EDUCATION",
          },
          {
            id: "c27",
            courseId: "MAED-EM",
            courseName: "Master of Arts in Education in Educational Management",
            degree: "MASTER OF ARTS IN EDUCATION",
          },
          {
            id: "c28",
            courseId: "MAED-ENG",
            courseName: "Master of Arts in Education in English",
            degree: "MASTER OF ARTS IN EDUCATION",
          },
          {
            id: "c29",
            courseId: "MAED-GSCI",
            courseName: "Master of Arts in Education in General Science",
            degree: "MASTER OF ARTS IN EDUCATION",
          },
          {
            id: "c30",
            courseId: "MAED-MATH",
            courseName: "Master of Arts in Education in Mathematics",
            degree: "MASTER OF ARTS IN EDUCATION",
          },
          {
            id: "c31",
            courseId: "MAED-PE",
            courseName: "Master of Arts in Education in Physical Education",
            degree: "MASTER OF ARTS IN EDUCATION",
          },
          {
            id: "c32",
            courseId: "MAED-TLE",
            courseName:
              "Master of Arts in Education in Technology and Livelihood Education",
            degree: "MASTER OF ARTS IN EDUCATION",
          },
          {
            id: "c33",
            courseId: "EDD-EM",
            courseName: "Doctor of Education in Educational Management",
            degree: "DOCTOR OF EDUCATION",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    campusId: "ALJ",
    campusName: "Carlos Hilado Memorial State University - Alijis",
    departments: [
      {
        id: "d4",
        departmentId: "CCS",
        name: "College of Computer Studies",
        courses: [
          {
            id: "c34",
            courseId: "BSIS",
            courseName: "Bachelor of Science in Information System",
            degree: "BACHELOR OF SCIENCE IN INFORMATION SYSTEM",
          },
          {
            id: "c35",
            courseId: "BSIT",
            courseName: "Bachelor of Science in Information Technology",
            degree: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY",
          },
        ],
      },
      {
        id: "d5",
        departmentId: "COED",
        name: "College of Education",
        courses: [
          {
            id: "c36",
            courseId: "BTVTE",
            courseName: "Bachelor of Technical Vocational Teacher Education",
            degree: "BACHELOR OF TECHNICAL VOCATIONAL TEACHER EDUCATION",
          },
        ],
      },
      {
        id: "d6",
        departmentId: "COE",
        name: "College of Engineering",
        courses: [
          {
            id: "c37",
            courseId: "BSCpE",
            courseName: "Bachelor of Science in Computer Engineering",
            degree: "BACHELOR OF SCIENCE IN COMPUTER ENGINEERING",
          },
          {
            id: "c38",
            courseId: "BSECE",
            courseName: "Bachelor of Electronics Engineering",
            degree: "BACHELOR OF ELECTRONICS ENGINEERING",
          },
        ],
      },
      {
        id: "d7",
        departmentId: "CIT",
        name: "College of Industrial Technology",
        courses: [
          {
            id: "c39",
            courseId: "BSIT-ADT",
            courseName:
              "Bachelor of Industrial Technology major in Architectural Drafting Technology",
            degree: "BACHELOR OF INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c40",
            courseId: "BSIT-COMPT",
            courseName:
              "Bachelor of Industrial Technology major in Computer Technology",
            degree: "BACHELOR OF INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c41",
            courseId: "BSIT-CULT",
            courseName:
              "Bachelor of Industrial Technology major in Culinary Technology",
            degree: "BACHELOR OF INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c42",
            courseId: "BSIT-ELT",
            courseName:
              "Bachelor of Industrial Technology major in Electrical Technology",
            degree: "BACHELOR OF INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c43",
            courseId: "BSIT-ELCT",
            courseName:
              "Bachelor of Industrial Technology major in Electronics Technology",
            degree: "BACHELOR OF INDUSTRIAL TECHNOLOGY",
          },
          {
            id: "c44",
            courseId: "BSIT-MECHT",
            courseName:
              "Bachelor of Industrial Technology major in Mechanical Technology",
            degree: "BACHELOR OF INDUSTRIAL TECHNOLOGY",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    campusId: "BIN",
    campusName: "Carlos Hilado Memorial State University - Binalbagan",
    departments: [
      {
        id: "d8",
        departmentId: "CBMA",
        name: "College of Business Management and Accountancy",
        courses: [
          {
            id: "c45",
            courseId: "BSBA-FM",
            courseName:
              "Bachelor of Science in Business Administration major in Financial Management",
            degree: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION",
          },
        ],
      },
      {
        id: "d9",
        departmentId: "CCS",
        name: "College of Computer Studies",
        courses: [
          {
            id: "c46",
            courseId: "BSIT",
            courseName: "Bachelor of Science in Information Technology",
            degree: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY",
          },
        ],
      },
      {
        id: "d10",
        departmentId: "CCJ",
        name: "College of Criminal Justice",
        courses: [
          {
            id: "c47",
            courseId: "BSCRIM",
            courseName: "Bachelor of Science in Criminology",
            degree: "BACHELOR OF SCIENCE IN CRIMINOLOGY",
          },
        ],
      },
      {
        id: "d11",
        departmentId: "COED",
        name: "College of Education",
        courses: [
          {
            id: "c48",
            courseId: "BEEd",
            courseName: "Bachelor of Elementary Education",
            degree: "BACHELOR OF ELEMENTARY EDUCATION",
          },
          {
            id: "c49",
            courseId: "BSEd-SCI",
            courseName: "Bachelor of Secondary Education major in Science",
            degree: "BACHELOR OF SECONDARY EDUCATION",
          },
          {
            id: "c50",
            courseId: "BTLE-HE",
            courseName:
              "Bachelor of Technology and Livelihood Education major in Home Economics",
            degree: "BACHELOR OF TECHNOLOGY AND LIVELIHOOD EDUCATION",
          },
        ],
      },
      {
        id: "d12",
        departmentId: "CF",
        name: "College of Fisheries",
        courses: [
          {
            id: "c51",
            courseId: "BSF",
            courseName: "Bachelor of Science in Fisheries",
            degree: "BACHELOR OF SCIENCE IN FISHERIES",
          },
        ],
      },
    ],
  },
  {
    id: "4",
    campusId: "FT",
    campusName: "Carlos Hilado Memorial State University - Fortune Towne",
    departments: [
      {
        id: "d13",
        departmentId: "CBMA",
        name: "College of Business Management and Accountancy",
        courses: [
          {
            id: "c52",
            courseId: "BSA",
            courseName: "Bachelor of Science in Accountancy",
            degree: "BACHELOR OF SCIENCE IN ACCOUNTANCY",
          },
          {
            id: "c53",
            courseId: "BSBA-FM",
            courseName:
              "Bachelor of Science in Business Administration major in Financial Management",
            degree: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION",
          },
          {
            id: "c54",
            courseId: "BSE",
            courseName: "Bachelor of Science in Entrepreneurship",
            degree: "BACHELOR OF SCIENCE IN ENTREPRENEURSHIP",
          },
          {
            id: "c55",
            courseId: "BSMA",
            courseName: "Bachelor of Science in Management Accounting",
            degree: "BACHELOR OF SCIENCE IN MANAGEMENT ACCOUNTING",
          },
          {
            id: "c56",
            courseId: "BSOA",
            courseName: "Bachelor of Science in Office Administration",
            degree: "BACHELOR OF SCIENCE IN OFFICE ADMINISTRATION",
          },
          {
            id: "c57",
            courseId: "MBA",
            courseName: "Master in Business Administration",
            degree: "MASTER IN BUSINESS ADMINISTRATION",
          },
        ],
      },
      {
        id: "d14",
        departmentId: "CCS",
        name: "College of Computer Studies",
        courses: [
          {
            id: "c58",
            courseId: "BSIS",
            courseName: "Bachelor of Science in Information Systems",
            degree: "BACHELOR OF SCIENCE IN INFORMATION SYSTEMS",
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
