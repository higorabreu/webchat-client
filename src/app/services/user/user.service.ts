import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:8080/user';
  private token: string | null = localStorage.getItem('token');

  constructor(private http: HttpClient) {}

  userExists(username: string): Observable<boolean> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    
    return this.http.get<boolean>(`${this.baseUrl}/exists/${username}`, { headers });
  }
}
