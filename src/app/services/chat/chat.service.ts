import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getCurrentUserId, getCurrentUserFromToken } from '../../utils/utils';
import { WebSocketService } from '../websocket/websocket.service';

export interface Conversation {
  id: string;
  userId: string;
  username: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSenderUsername?: string;
  unread: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  private messagesSubject: Subject<any> = new Subject<any>();
  private token: string | null = localStorage.getItem('token');
  private apiUrl: string = 'http://localhost:8080';
  private conversationsCache: Map<string, Conversation[]> = new Map();

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService,
  ) {
    this.webSocketService.getMessages().subscribe(message => {
      this.messagesSubject.next(message);
    });
  }

  connect(): void {
    this.webSocketService.connect();
  }

  connectToConversation(conversationId: string): void {
    if (!conversationId) {
      return;
    }

    this.webSocketService.subscribeToMessages(conversationId);
  }

  sendMessage(sender: string, recipient: string, text: string): void {
    const message = {
      sender: sender,
      recipient: recipient,
      content: text,
      senderUsername: sender,
      recipientUsername: recipient,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    this.webSocketService.sendMessage(message);
  }

  getMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
  }

  fetchMessageHistory(user1: string, user2: string): Observable<any[]> {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      return new Observable(subscriber => subscriber.complete());
    }

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`,
    );

    return this.http.get<any[]>(`${this.apiUrl}/messages`, {
      headers: headers,
      params: {
        user1Id: currentUserId,
        user2Id: user2,
      },
    });
  }

  getUserConversations(username: string): Observable<Conversation[]> {
    if (this.conversationsCache.has(username)) {
      return new Observable(subscriber => {
        subscriber.next(this.conversationsCache.get(username));
        subscriber.complete();
      });
    }

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`,
    );

    return new Observable(subscriber => {
      this.http
        .get<
          Conversation[]
        >(`${this.apiUrl}/conversations/${username}`, { headers })
        .subscribe({
          next: conversations => {
            this.conversationsCache.set(username, conversations);
            subscriber.next(conversations);
            subscriber.complete();
          },
          error: error => {
            subscriber.error(error);
          },
        });
    });
  }

  markMessagesAsRead(
    conversationId: string,
    currentUserId: string,
  ): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`,
    );

    return this.http.post<any>(`${this.apiUrl}/messages/read`, null, {
      headers: headers,
      params: {
        conversationId: conversationId,
        userId: currentUserId,
      },
    });
  }

  clearConversationsCache(username?: string): void {
    if (username) {
      this.conversationsCache.delete(username);
    } else {
      this.conversationsCache.clear();
    }
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }
}
