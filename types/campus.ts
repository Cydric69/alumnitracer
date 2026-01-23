// types/campus.ts
export interface Campus {
  id: string;
  name: string;
  description: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampusInput {
  name: string;
  description: string;
  address: string;
}

export interface CampusFormData {
  name: string;
  description: string;
  address: string;
}
