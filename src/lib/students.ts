/**
 * Student Management Service - Get all registered students
 */

// Import getStudents function from auth
function getStudents(): Record<string, { name: string; studentId: string }> {
  try {
    const data = localStorage.getItem('are_you_safe_students');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export interface StudentInfo {
  studentId: string;
  name: string;
}

/**
 * Get all registered students
 */
export function getAllStudents(): StudentInfo[] {
  const students = getStudents();
  return Object.values(students).map(s => ({
    studentId: s.studentId,
    name: s.name,
  }));
}

/**
 * Get student by ID
 */
export function getStudentById(studentId: string): StudentInfo | null {
  const students = getStudents();
  return students[studentId] || null;
}

