import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password });
  }

  register(
    username: string,
    name: string,
    email: string,
    password: string,
  ): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/register`,
      { username, name, email, password },
      { responseType: 'text' },
    );
  }

  isTokenValid(username: string, headers: HttpHeaders): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.apiUrl}/check-token`,
      { username },
      { headers },
    );
  }
}
