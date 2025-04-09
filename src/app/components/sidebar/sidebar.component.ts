import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConversationItemComponent } from '../conversation-item/conversation-item.component';
import { CommonModule } from '@angular/common';
import { UserSearchComponent } from '../user-search/user-search.component';
import { ChatService, Conversation } from '../../services/chat/chat.service';
import { getCurrentUserFromToken, getCurrentUserId } from '../../utils/utils';
import { Subscription } from 'rxjs';
import { SharedService } from '../../services/shared/shared.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ConversationItemComponent, CommonModule, UserSearchComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  currentUsername: string = '';
  activeConversationUsername: string | null = null;
  private userSelectedSubscription?: Subscription;
  
  constructor(
    private chatService: ChatService,
    private sharedService: SharedService
  ) {}
  
  ngOnInit(): void {
    this.currentUsername = getCurrentUserFromToken();
    
    if (this.currentUsername) {
      this.chatService.connect(this.currentUsername);
      
      this.loadConversations();
      
      this.userSelectedSubscription = this.sharedService.userSelected$.subscribe((username) => {
        this.activeConversationUsername = username;
      });
    }
  }
  
  ngOnDestroy(): void {
    if (this.userSelectedSubscription) {
      this.userSelectedSubscription.unsubscribe();
    }
  }
  
  loadConversations(): void {
    if (!this.currentUsername) return;
    
    this.chatService.getUserConversations(this.currentUsername).subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.sortConversations();
      },
      error: (error) => {
        console.error('Erro ao buscar conversas:', error);
      }
    });
  }
  
  sortConversations(): void {
    this.conversations.sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });
  }
  
  selectConversation(conversation: Conversation): void {
    this.activeConversationUsername = conversation.username;
    this.sharedService.selectUser(conversation.username);
    
    this.markMessagesAsRead(conversation);
  }
  
  private markMessagesAsRead(conversation: Conversation): void {
    if (!conversation || !conversation.unread) return;
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.error('ID do usuário não encontrado no token');
      return;
    }
    
    this.chatService.markMessagesAsRead(conversation.id, currentUserId)
  }
}
