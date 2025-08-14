import { User } from "../types";

// Navigation parameter types
export type RootStackParamList = {
  Login: undefined;
  DataSync: { user: User };
  Dashboard: undefined;
  Attendance: undefined;
  Profile: undefined;
  ClassDetails: {
    classId: string;
  };
  StudentDetails: {
    studentId: string;
    classId: string;
  };
  TakeAttendance: {
    classId: string;
  };
  Reports: undefined;
  SyncLogs: undefined;
  Marks: undefined;
  AddEditMarks: {
    mode: "add" | "edit";
    subjectId?: string;
    classId?: string;
    month?: string;
  };
};

// Navigation method types
export type NavigationProps = {
  navigate: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T],
  ) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  reset: (state: any) => void;
  push: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T],
  ) => void;
  pop: (count?: number) => void;
  popToTop: () => void;
  replace: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T],
  ) => void;
};

// Screen names type
export type ScreenNames = keyof RootStackParamList;
