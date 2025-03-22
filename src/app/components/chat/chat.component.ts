import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { MessageInputBoxComponent } from '../message-input-box/message-input-box.component';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat/chat.service';
import { getCurrentUserFromToken } from '../../utils/utils';
import { SharedService } from '../../services/shared/shared.service';
import { Subscription } from 'rxjs';

export interface Message {
  id?: string;
  content: string;
  timestamp: string;
  sent: boolean;
  status?: 'sending' | 'sent' | 'delivered';
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
  private userSelectedSubscription!: Subscription;
  private messagesSubscription!: Subscription;

  constructor(
    private chatService: ChatService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.currentUser = getCurrentUserFromToken();
    this.userSelectedSubscription = this.sharedService.userSelected$.subscribe((username) => {
      this.startNewChat(username);
    });
    
    this.messagesSubscription = this.chatService.getMessages().subscribe(message => {
      console.log('Mensagem processada no componente:', message);
      
      const messageDate = new Date(message.timestamp);
      const hours = messageDate.getHours().toString().padStart(2, '0');
      const minutes = messageDate.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      if (message.sender === this.currentUser) {
        const messageIndex = this.findMatchingMessage(message.content);
        
        if (messageIndex !== -1) {
          this.messages[messageIndex].status = 'delivered';
          console.log('Mensagem confirmada pelo servidor:', this.messages[messageIndex]);
        } else {
          this.addNewMessage(message.content, formattedTime, true, 'delivered');
        }
      } else {
        this.addNewMessage(message.content, formattedTime, false);
      }
    });
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
    this.userSelectedSubscription.unsubscribe();
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  startNewChat(recipient: string): void {
    this.currentChatUser = recipient;
    this.conversationId = this.getConversationId(this.currentUser, recipient);
    this.messages = [];
    this.chatService.connect(this.currentUser, this.conversationId);

    console.log('Chat started with: ', recipient);
  }

  handleMessageSent(newMessage: { message: string; timestamp: string }) {
    this.addNewMessage(newMessage.message, newMessage.timestamp, true, 'sending');

    this.chatService.sendMessage(this.currentUser, this.currentChatUser, newMessage.message);
  }

  private addNewMessage(content: string, timestamp: string, sent: boolean, status: 'sending' | 'sent' | 'delivered' = 'sent'): void {
    const message: Message = {
      id: this.generateMessageId(),
      content,
      timestamp,
      sent,
      status
    };
    
    this.messages.push(message);
  }

  private generateMessageId(): string {
    return Date.now().toString() + Math.floor(Math.random() * 1000);
  }

  private findMatchingMessage(content: string): number {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].sent && this.messages[i].content === content && this.messages[i].status !== 'delivered') {
        return i;
      }
    }
    return -1;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  private getConversationId(sender: string, recipient: string): string {
    return sender < recipient ? `${sender}-${recipient}` : `${recipient}-${sender}`;
  }
}
