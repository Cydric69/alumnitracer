// types/department.ts
export interface Department {
  id: string;
  name: string;
  campus: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentInput {
  name: string;
  campus: string; // Campus ID
}

export interface SimpleDepartment {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
