import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ChatService, Conversation } from '../../services/chat/chat.service';
import { Subscription } from 'rxjs';
import { getCurrentUserFromToken } from '../../utils/utils';

@Component({
  selector: 'app-conversation-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-item.component.html',
  styleUrls: ['./conversation-item.component.css']
})
export class ConversationItemComponent implements OnInit, OnDestroy {
  @Input() conversation!: Conversation;
  @Input() isActive: boolean = false;
  @Output() itemClicked = new EventEmitter<void>();
  @Output() messageReceived = new EventEmitter<void>();
  
  name: string = '';
  username: string = '';
  message: string = '';
  unread: boolean = false;
  isLastMessageFromCurrentUser: boolean = false;
  
  private messageSubscription?: Subscription;
  private currentUser: string = '';
  
  constructor(private chatService: ChatService) {
    this.currentUser = getCurrentUserFromToken() || '';
  }
  
  ngOnInit(): void {
    this.updateDisplayData();
    this.connectToWebSocket();
  }
  
  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
  
  private updateDisplayData(): void {
    this.name = this.conversation.name;
    this.username = this.conversation.username;
    this.message = this.conversation.lastMessage;
    this.unread = this.conversation.unread;
    this.isLastMessageFromCurrentUser = 
      this.conversation.lastMessageSenderUsername === this.currentUser;
  }
  
  private connectToWebSocket(): void {
    // Inscrever-se para receber mensagens globais
    this.messageSubscription = this.chatService.getMessages().subscribe(message => {
      // Verificar se a mensagem pertence a esta conversa
      if (this.isMessageForThisConversation(message)) {
        // Atualizar os dados da conversa com base na nova mensagem
        this.handleNewMessage(message);
      }
    });
    
    // Se temos um ID de conversa, conectar a esse canal específico
    if (this.conversation.id) {
      this.chatService.connectToConversation(this.conversation.id);
    }
  }
  
  private isMessageForThisConversation(message: any): boolean {
    // Verificar usando o ID da conversa
    if (message.conversationId && message.conversationId === this.conversation.id) {
      return true;
    }
    
    // Verificar usando os nomes de usuário (método alternativo)
    const isBetweenUsers = 
      (message.senderUsername === this.currentUser && 
       message.recipientUsername === this.conversation.username) || 
      (message.recipientUsername === this.currentUser && 
       message.senderUsername === this.conversation.username);
       
    return isBetweenUsers;
  }
  
  private handleNewMessage(message: any): void {
    // Atualizar os dados da conversa
    this.conversation.lastMessage = message.content;
    this.conversation.lastMessageTime = message.timestamp;
    this.conversation.lastMessageSenderUsername = message.senderUsername;
    
    // Atualizar se a mensagem está lida
    if (!this.isActive && message.senderUsername !== this.currentUser) {
      this.conversation.unread = true;
    }
    
    // Atualizar a exibição
    this.updateDisplayData();
    
    // Emitir evento para que o componente pai saiba sobre a nova mensagem
    this.messageReceived.emit();
  }
  
  onClick(): void {
    // Marcar como lido na UI imediatamente se estiver não lido
    if (this.unread) {
      this.unread = false;
      this.conversation.unread = false;
    }
    
    this.itemClicked.emit();
  }
}
