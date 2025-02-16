import { jwtDecode } from "jwt-decode";

export function getCurrentUserFromToken():  string {
  const token = localStorage.getItem('token');
  if (!token) return '';

  try {
    const decodedToken: any = jwtDecode(token);
    return decodedToken.sub || '';
  } catch (error) {
    console.error('Erro ao decodificar o token:', error);
    return '';
  }
}
