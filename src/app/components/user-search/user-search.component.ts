import { Component, EventEmitter, Output } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent {
  username: string = '';
  userExists: boolean | null = null;

  @Output() userSelected = new EventEmitter<string>();

  constructor(private userService: UserService) {}

  selectUser() {
    if (this.username.trim()) {
      this.userService.userExists(this.username).subscribe(
        (exists) => {
          this.userExists = exists;
          if (exists) {
            this.userSelected.emit(this.username); 
            this.resetInput();
            console.log('Usuário encontrado.');
          } else {
            console.log('Usuário não encontrado.');
          }
        },
        (error) => {
          console.error('Erro ao verificar usuário:', error);
          this.userExists = null;
        }
      );
    } else {
      this.userExists = null;
    }
  }

  private resetInput() {
    this.username = '';
    this.userExists = null;
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.selectUser();
    }
  }
}
