import { Component } from '@angular/core';
import { MessageInputBoxComponent } from '../message-input-box/message-input-box.component';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { CommonModule } from '@angular/common';

interface Message {
  text: string;
  sent: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MessageInputBoxComponent, MessageBoxComponent, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})

export class ChatComponent {
  messages: Message[] = [];

  handleMessageSent(newMessage: string) {
    this.messages.push({ text: newMessage, sent: true });
  }
}
