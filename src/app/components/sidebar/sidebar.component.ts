import { Component } from '@angular/core';
import { ConversationItemComponent } from '../conversation-item/conversation-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ConversationItemComponent, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  conversations = [
    { name: 'Ana Maria', username: '@ana_maria', message: 'Tirar a lixo da sala', unread: true },
    { name: 'Joao Carlos', username: '@carlosjoao', message: 'Reunião às 15:00', unread: true },
    { name: 'Pedro Afonso', username: '@pedrinhoa', message: 'Vamos ao cinema?', unread: true },
    { name: 'Beatriz', username: '@beatriz_123', message: 'Revisar o relatório', unread: false },
    { name: 'Carlos Padilha', username: '@carlinhopad', message: 'Aniversário do papai!', unread: false }
  ];
}
