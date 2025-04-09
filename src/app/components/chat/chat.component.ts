import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { MessageInputBoxComponent } from '../message-input-box/message-input-box.component';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat/chat.service';
import { getCurrentUserFromToken, getCurrentUserId } from '../../utils/utils';
import { SharedService } from '../../services/shared/shared.service';
import { Subscription } from 'rxjs';

export interface Message {
  id?: string;
  tempId?: string;
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
  loading: boolean = false;
  currentConversationData: any = null;

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
      console.log('Mensagem recebida do servidor:', message);
      
      const formattedTime = this.formatMessageTime(message.timestamp);
      
      const isSender = message.senderUsername === this.currentUser;
      
      if (isSender) {
        const messageIndex = this.findPendingMessage(message.content);
        
        if (messageIndex !== -1) {
          this.messages[messageIndex].id = message.id?.toString();
          this.messages[messageIndex].timestamp = formattedTime;
          this.messages[messageIndex].status = 'delivered';
          console.log('Mensagem atualizada com dados do servidor:', this.messages[messageIndex]);
        } else {
          this.addNewMessage(message.content, formattedTime, true, 'delivered', message.id?.toString());
        }
      } else {
        this.addNewMessage(message.content, formattedTime, false, 'sent', message.id?.toString());
        
        if (message.senderUsername === this.currentChatUser && this.currentConversationData) {
          this.markMessagesAsRead();
        }
      }
      
      this.chatService.clearConversationsCache(this.currentUser);
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
    this.conversationId = this.chatService.generateConversationId(this.currentUser, recipient);
    this.messages = [];
    this.chatService.connect(this.currentUser, this.conversationId);

    console.log('Chat started with: ', recipient);
    
    this.loadMessageHistory(recipient);
  }
  
  loadMessageHistory(recipientUsername: string): void {
    this.loading = true;
    
    this.chatService.getUserConversations(this.currentUser).subscribe({
      next: (conversations) => {
        const conversation = conversations.find(conv => conv.username === recipientUsername);
        
        if (conversation) {
          this.currentConversationData = conversation;
          
          this.chatService.fetchMessageHistory(this.currentUser, conversation.userId).subscribe({
            next: (messages) => {
              this.messages = [];
              
              messages.forEach(message => {
                const formattedTime = this.formatMessageTime(message.timestamp);
                const isSender = message.senderUsername === this.currentUser;
                
                this.addNewMessage(
                  message.content, 
                  formattedTime, 
                  isSender, 
                  'delivered', 
                  message.id?.toString()
                );
              });
              
              this.loading = false;
              setTimeout(() => this.scrollToBottom(), 0);
              
              this.markMessagesAsRead();
            },
            error: (error) => {
              console.error('Erro ao carregar histórico de mensagens:', error);
              this.loading = false;
            }
          });
        } else {
          console.log('Conversa não encontrada no histórico, criando nova conversa');
          this.messages = [];
          this.currentConversationData = null;
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Erro ao buscar informações da conversa:', error);
        this.loading = false;
      }
    });
  }

  handleMessageSent(newMessage: { message: string; timestamp: string }) {
    const tempId = this.generateTempId();
    
    this.addNewMessage(newMessage.message, newMessage.timestamp, true, 'sending', undefined, tempId);

    this.chatService.sendMessage(this.currentUser, this.currentChatUser, newMessage.message);
    
    this.chatService.clearConversationsCache(this.currentUser);
  }

  private addNewMessage(
    content: string, 
    timestamp: string, 
    sent: boolean, 
    status: 'sending' | 'sent' | 'delivered' = 'sent', 
    id?: string,
    tempId?: string
  ): void {
    const message: Message = {
      id,
      tempId,
      content,
      timestamp,
      sent,
      status
    };
    
    this.messages.push(message);
  }

  private generateTempId(): string {
    return `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private findPendingMessage(content: string): number {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].sent && 
          this.messages[i].content === content && 
          (this.messages[i].status === 'sending' || this.messages[i].status === 'sent')) {
        return i;
      }
    }
    return -1;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (!this.messagesContainer) return;
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  private formatMessageTime(timestamp: string): string {
    if (!timestamp) {
      return this.getCurrentTimeFormatted();
    }
    
    try {
      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        throw new Error('Data inválida');
      }
      
      // Formato: HH:MM
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error('Erro ao formatar timestamp:', e);
      return this.getCurrentTimeFormatted();
    }
  }

  private markMessagesAsRead(): void {
    if (!this.currentConversationData) return;
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.error('ID do usuário não encontrado no token');
      return;
    }
    
    this.chatService.markMessagesAsRead(this.currentConversationData.id, currentUserId)
      .subscribe({
        next: (response) => {
          if (response.success && response.markedCount > 0) {
            console.log(`${response.markedCount} mensagens marcadas como lidas`);
            this.chatService.clearConversationsCache(this.currentUser);
          }
        },
        error: (error) => {
          console.error('Erro ao marcar mensagens como lidas:', error);
        }
      });
  }

  private getCurrentTimeFormatted(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
