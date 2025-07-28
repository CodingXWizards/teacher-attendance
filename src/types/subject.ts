export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSubjectRequest {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface SubjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
