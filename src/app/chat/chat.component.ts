import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { MessageInputBoxComponent } from '../components/message-input-box/message-input-box.component';
import { MessageBoxComponent } from '../components/message-box/message-box.component';
import { CommonModule } from '@angular/common';

export interface Message {
  text: string;
  timestamp: string;
  sent: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MessageInputBoxComponent, MessageBoxComponent, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})

export class ChatComponent implements AfterViewChecked{
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  messages: Message[] = [];

  handleMessageSent(newMessage: { message: string; timestamp: string }) {
    this.messages.push({ 
      text: newMessage.message, 
      timestamp: newMessage.timestamp,
      sent: true 
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }
}
