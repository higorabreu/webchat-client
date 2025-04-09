import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConversationItemComponent } from '../conversation-item/conversation-item.component';
import { CommonModule } from '@angular/common';
import { UserSearchComponent } from '../user-search/user-search.component';
import { ChatService, Conversation } from '../../services/chat/chat.service';
import { getCurrentUserFromToken } from '../../utils/utils';
import { Subscription, interval } from 'rxjs';
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
  private refreshSubscription?: Subscription;
  private messageSubscription?: Subscription;
  private userSelectedSubscription?: Subscription;
  
  constructor(
    private chatService: ChatService,
    private sharedService: SharedService
  ) {}
  
  ngOnInit(): void {
    this.currentUsername = getCurrentUserFromToken();
    
    if (this.currentUsername) {
      this.loadConversations();
      
      this.refreshSubscription = interval(5000).subscribe(() => {
        this.loadConversations();
      });
      
      this.messageSubscription = this.chatService.getMessages().subscribe((message) => {
        this.chatService.clearConversationsCache(this.currentUsername);
        this.loadConversations();
      });
      
      this.userSelectedSubscription = this.sharedService.userSelected$.subscribe(() => {
        setTimeout(() => {
          this.chatService.clearConversationsCache(this.currentUsername);
          this.loadConversations();
        }, 500);
      });
    }
  }
  
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.userSelectedSubscription) {
      this.userSelectedSubscription.unsubscribe();
    }
  }
  
  loadConversations(): void {
    if (!this.currentUsername) return;
    
    this.chatService.getUserConversations(this.currentUsername).subscribe({
      next: (conversations) => {
        this.conversations = conversations;
      },
      error: (error) => {
        console.error('Erro ao buscar conversas:', error);
      }
    });
  }
  
  selectConversation(conversation: Conversation): void {
    this.sharedService.selectUser(conversation.username);
  }
}
