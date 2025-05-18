import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string; // subject (username)
  id: string; // id
  name: string; // name
  exp: number; // expiration
  iat: number; // issued at
}

export function getCurrentUserFromToken(): string {
  const token = localStorage.getItem('token');
  if (!token) return '';

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub || '';
  } catch (e) {
    console.error('Erro ao decodificar token:', e);
    return '';
  }
}

export function getCurrentUserId(): string {
  const token = localStorage.getItem('token');
  if (!token) return '';

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.id || '';
  } catch (e) {
    console.error('Erro ao decodificar token:', e);
    return '';
  }
}

export function getUserNameFromToken(): string {
  const token = localStorage.getItem('token');
  if (!token) return '';

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.name || '';
  } catch (e) {
    console.error('Erro ao decodificar token:', e);
    return '';
  }
}
