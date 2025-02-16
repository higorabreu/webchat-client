import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { MessageInputBoxComponent } from '../message-input-box/message-input-box.component';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat/chat.service';
import { getCurrentUserFromToken } from '../../utils/utils';

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

export class ChatComponent implements AfterViewChecked, OnInit, OnDestroy{
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  messages: Message[] = [];
  currentUser: string = '';
  currentChatUser: string = '';
  conversationId: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.currentUser = getCurrentUserFromToken();
  }

  startNewChat(recipient: string): void {
    this.currentChatUser = recipient;
    this.conversationId = this.getConversationId(this.currentUser, recipient);
    this.messages = [];
    this.chatService.connect(this.currentUser, this.conversationId);

    console.log('Chat started with: ', recipient);
  }

  handleMessageSent(newMessage: { message: string; timestamp: string }) {
    this.messages.push({ 
      text: newMessage.message, 
      timestamp: newMessage.timestamp,
      sent: true 
    });

    this.chatService.sendMessage(this.currentUser, this.conversationId, newMessage.message);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  ngOnDestroy(): void {
      this.chatService.disconnect();
  }

  private getConversationId(sender: string, recipient: string): string {
    return sender < recipient ? `${sender}-${recipient}` : `${recipient}-${sender}`;
  }

  
}
