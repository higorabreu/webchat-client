import { Component, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  message: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('username', this.username)
        this.message = "Login successful!";
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage = "User not found.";
        } else if (err.status === 401) {
          this.errorMessage = "Invalid password.";
        } else {
          this.errorMessage = "Failed to login.";
        }
      }
    });
  }
}
