// types/course.ts
export interface Course {
  id: string;
  name: string;
  department: {
    id: string;
    name: string;
    campus: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CourseInput {
  name: string;
  department: string; // Department ID
}
