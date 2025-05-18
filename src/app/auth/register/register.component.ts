import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  username: string = '';
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  message: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  checkPasswords(): boolean {
    return this.password === this.confirmPassword;
  }

  register() {
    if (!this.checkPasswords()) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService
      .register(this.username, this.name, this.email, this.password)
      .subscribe({
        next: () => {
          this.message = 'Registration successful!';
          this.router.navigate(['/login']);
        },
        error: err => {
          if (err.status === 409) {
            this.errorMessage = 'Email or Username already registered.';
          } else {
            this.errorMessage = 'Failed to register user.';
          }
        },
      });
  }
}
