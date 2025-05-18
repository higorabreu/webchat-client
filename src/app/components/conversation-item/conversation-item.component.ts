import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ChatService, Conversation } from '../../services/chat/chat.service';
import { Subscription } from 'rxjs';
import { getCurrentUserFromToken } from '../../utils/utils';

@Component({
  selector: 'app-conversation-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-item.component.html',
  styleUrls: ['./conversation-item.component.css'],
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
    this.connectToMessages();
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

  private connectToMessages(): void {
    this.messageSubscription = this.chatService
      .getMessages()
      .subscribe(message => {
        if (this.isMessageForThisConversation(message)) {
          this.handleNewMessage(message);
        }
      });

    if (this.conversation.id) {
      this.chatService.connectToConversation(this.conversation.id);
    }
  }

  private isMessageForThisConversation(message: any): boolean {
    if (
      message.conversationId &&
      message.conversationId === this.conversation.id
    ) {
      return true;
    }

    const isBetweenUsers =
      (message.senderUsername === this.currentUser &&
        message.recipientUsername === this.conversation.username) ||
      (message.recipientUsername === this.currentUser &&
        message.senderUsername === this.conversation.username);

    return isBetweenUsers;
  }

  private handleNewMessage(message: any): void {
    this.conversation.lastMessage = message.content;
    this.conversation.lastMessageTime = message.timestamp;
    this.conversation.lastMessageSenderUsername = message.senderUsername;

    if (!this.isActive && message.senderUsername !== this.currentUser) {
      this.conversation.unread = true;
    }

    this.updateDisplayData();
    this.messageReceived.emit();
  }

  onClick(): void {
    if (this.unread) {
      this.unread = false;
      this.conversation.unread = false;
    }

    this.itemClicked.emit();
  }
}
