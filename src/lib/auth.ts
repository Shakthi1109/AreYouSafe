/**
 * Service d'authentification simple pour demo
 * Utilise localStorage pour stocker les informations de connexion
 */
const AUTH_KEY = 'are_you_safe_auth';
const TEACHER_PASSWORDS_KEY = 'are_you_safe_teacher_passwords';
const STUDENT_PATTERNS_KEY = 'are_you_safe_student_patterns';

export interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher';
  email?: string;
  token?: string;
}

// 默认密码和手势（用于demo）
const DEFAULT_TEACHER_PASSWORD = 'teacher123';
const DEFAULT_STUDENT_PATTERN = [0, 1, 2, 5, 8]; // 默认手势：左上到右下对角线

/**
 * 初始化默认密码和手势
 */
function initializeCredentials() {
  const teacherPasswords = getTeacherPasswords();
  if (Object.keys(teacherPasswords).length === 0) {
    // 设置默认教师密码
    const defaultPasswords: Record<string, string> = {
      'default': DEFAULT_TEACHER_PASSWORD,
    };
    localStorage.setItem(TEACHER_PASSWORDS_KEY, JSON.stringify(defaultPasswords));
  }

  const studentPatterns = getStudentPatterns();
  if (Object.keys(studentPatterns).length === 0) {
    // 设置默认学生手势
    const defaultPatterns: Record<string, number[]> = {
      'default': DEFAULT_STUDENT_PATTERN,
    };
    localStorage.setItem(STUDENT_PATTERNS_KEY, JSON.stringify(defaultPatterns));
  }
}

/**
 * 获取教师密码存储
 */
function getTeacherPasswords(): Record<string, string> {
  try {
    const data = localStorage.getItem(TEACHER_PASSWORDS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * 获取学生手势存储
 */
function getStudentPatterns(): Record<string, number[]> {
  try {
    const data = localStorage.getItem(STUDENT_PATTERNS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * 验证教师密码
 */
export function verifyTeacherPassword(email: string, password: string): boolean {
  initializeCredentials();
  const passwords = getTeacherPasswords();
  
  // 检查是否有该邮箱的密码
  const storedPassword = passwords[email];
  if (!storedPassword) {
    return false; // 用户未注册
  }
  return storedPassword === password;
}

/**
 * 验证学生手势
 */
export function verifyStudentPattern(studentId: string, pattern: number[]): boolean {
  initializeCredentials();
  const patterns = getStudentPatterns();
  
  // 将手势转换为字符串进行比较
  const patternStr = JSON.stringify(pattern.sort());
  
  // 检查是否有该学生ID的手势
  const storedPattern = patterns[studentId];
  if (!storedPattern) {
    return false; // 学生未注册
  }
  
  const storedPatternStr = JSON.stringify(storedPattern.sort());
  return patternStr === storedPatternStr;
}

/**
 * 检查教师是否已注册
 */
export function isTeacherRegistered(email: string): boolean {
  const passwords = getTeacherPasswords();
  return !!passwords[email];
}

/**
 * 检查学生是否已注册
 */
export function isStudentRegistered(studentId: string): boolean {
  const patterns = getStudentPatterns();
  return !!patterns[studentId];
}

/**
 * 注册教师
 */
export function registerTeacher(email: string, password: string, name: string): boolean {
  if (isTeacherRegistered(email)) {
    return false; // 邮箱已注册
  }
  
  const passwords = getTeacherPasswords();
  passwords[email] = password;
  localStorage.setItem(TEACHER_PASSWORDS_KEY, JSON.stringify(passwords));
  
  // 存储教师信息
  const teachersKey = 'are_you_safe_teachers';
  const teachers = getTeachers();
  teachers[email] = { name, email };
  localStorage.setItem(teachersKey, JSON.stringify(teachers));
  
  return true;
}

/**
 * 注册学生
 */
export function registerStudent(studentId: string, pattern: number[], name: string): boolean {
  if (isStudentRegistered(studentId)) {
    return false; // 学生ID已注册
  }
  
  if (pattern.length < 4) {
    return false; // 手势太短
  }
  
  const patterns = getStudentPatterns();
  patterns[studentId] = pattern;
  localStorage.setItem(STUDENT_PATTERNS_KEY, JSON.stringify(patterns));
  
  // 存储学生信息
  const studentsKey = 'are_you_safe_students';
  const students = getStudents();
  students[studentId] = { name, studentId };
  localStorage.setItem(studentsKey, JSON.stringify(students));
  
  return true;
}

/**
 * 获取教师信息
 */
function getTeachers(): Record<string, { name: string; email: string }> {
  try {
    const data = localStorage.getItem('are_you_safe_teachers');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * 获取学生信息
 */
function getStudents(): Record<string, { name: string; studentId: string }> {
  try {
    const data = localStorage.getItem('are_you_safe_students');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * 根据邮箱获取教师姓名
 */
export function getTeacherName(email: string): string | null {
  const teachers = getTeachers();
  return teachers[email]?.name || null;
}

/**
 * 根据学生ID获取学生姓名
 */
export function getStudentName(studentId: string): string | null {
  const students = getStudents();
  return students[studentId]?.name || null;
}

/**
 * Connexion d'un utilisateur
 */
export function login(userId: string, userName: string, role: 'student' | 'teacher', email?: string): void {
  const user: User = {
    id: userId,
    name: userName,
    role,
    email,
    token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

/**
 * Déconnexion
 */
export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

/**
 * Récupérer l'utilisateur actuellement connecté
 */
export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data) as User;
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'utilisateur:', error);
    return null;
  }
}

/**
 * Vérifier si un utilisateur est connecté
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Vérifier si l'utilisateur est un enseignant
 */
export function isTeacher(): boolean {
  const user = getCurrentUser();
  return user?.role === 'teacher';
}

/**
 * Vérifier si l'utilisateur est un étudiant
 */
export function isStudent(): boolean {
  const user = getCurrentUser();
  return user?.role === 'student';
}

/**
 * Obtenir le token d'authentification
 */
export function getAuthToken(): string | null {
  const user = getCurrentUser();
  return user?.token || null;
}

