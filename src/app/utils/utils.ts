import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  id: string;
  name: string;
  exp: number;
  iat: number;
}

export function getCurrentUserFromToken(): string {
  const token = localStorage.getItem('token');
  if (!token) return '';

  const decoded = jwtDecode<JwtPayload>(token);
  return decoded.sub || '';
}

export function getCurrentUserId(): string {
  const token = localStorage.getItem('token');
  if (!token) return '';

  const decoded = jwtDecode<JwtPayload>(token);
  return decoded.id || '';
}

export function getUserNameFromToken(): string {
  const token = localStorage.getItem('token');
  if (!token) return '';

  const decoded = jwtDecode<JwtPayload>(token);
  return decoded.name || '';
}
