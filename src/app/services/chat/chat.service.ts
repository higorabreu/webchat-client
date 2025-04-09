import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as Stomp from '@stomp/stompjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getCurrentUserId, getCurrentUserFromToken } from '../../utils/utils';

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
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private stompClient: Stomp.Client | null = null;
  private messagesSubject: Subject<any> = new Subject<any>();
  private token: string | null = localStorage.getItem('token');
  private apiUrl: string = 'http://localhost:8080';
  private conversationsCache: Map<string, Conversation[]> = new Map();
  private activeSubscriptions: Set<string> = new Set();
  private isConnected: boolean = false;

  constructor(private http: HttpClient) {}

  connect(user: string): void {
    if (this.stompClient && this.stompClient.connected) {
      this.isConnected = true;
      return;
    }

    this.stompClient = new Stomp.Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        Authorization: `Bearer ${this.token}`
      },
      onConnect: () => {
        this.isConnected = true;
      },
      onStompError: (frame) => {
        console.error('Erro ao conectar ao WebSocket:', frame);
      },
      onWebSocketError: (event) => {
        console.error('Erro ao conectar ao WebSocket:', event);
      },
    });

    this.stompClient.activate();
  }

  connectToConversation(conversationId: string): void {
    if (!conversationId) {
      return;
    }

    if (!this.stompClient || !this.stompClient.connected) {
      const currentUser = getCurrentUserFromToken();
      if (currentUser) {
        this.connect(currentUser);
      
        setTimeout(() => {
          this.subscribeToMessages(conversationId);
        }, 1000);
      }
      return;
    }

    this.subscribeToMessages(conversationId);
  }

  private subscribeToMessages(conversationId: string): void {
    if (!this.stompClient?.connected) {
      return;
    }
    
    if (this.activeSubscriptions.has(conversationId)) {
      return;
    }
    
    const destination = `/user/queue/messages/${conversationId}`;
    
    this.stompClient.subscribe(destination, (message: any) => {
      const parsedMessage = JSON.parse(message.body);
      parsedMessage.conversationId = conversationId;
      this.messagesSubject.next(parsedMessage);
    });
    
    this.activeSubscriptions.add(conversationId);
  }

  subscribeToAllConversations(conversations: Conversation[]): void {
    if (!this.isConnected) {
      return;
    }
    
    conversations.forEach(conversation => {
      if (conversation.id) {
        this.subscribeToMessages(conversation.id);
      }
    });
  }

  sendMessage(sender: string, recipient: string, text: string): void {
    if (!this.stompClient?.connected) {
      return;
    }
    
    const message = {
      sender: sender,
      recipient: recipient,
      content: text,
      senderUsername: sender,
      recipientUsername: recipient,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    this.stompClient.publish({
      destination: '/app/chat.send',
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify(message),
    });
  }

  getMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
  }
  
  fetchMessageHistory(user1: string, user2: string): Observable<any[]> {
    const currentUserId = getCurrentUserId();
    
    if (!currentUserId) {
      return new Observable(subscriber => subscriber.complete());
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    
    return this.http.get<any[]>(`${this.apiUrl}/messages`, {
      headers: headers,
      params: {
        user1Id: currentUserId,
        user2Id: user2
      }
    });
  }
  
  getUserConversations(username: string): Observable<Conversation[]> {
    if (this.conversationsCache.has(username)) {
      return new Observable(subscriber => {
        subscriber.next(this.conversationsCache.get(username));
        subscriber.complete();
      });
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    
    return new Observable(subscriber => {
      this.http.get<Conversation[]>(`${this.apiUrl}/conversations/${username}`, { headers }).subscribe({
        next: (conversations) => {
          this.conversationsCache.set(username, conversations);
          subscriber.next(conversations);
          subscriber.complete();
        },
        error: (error) => {
          subscriber.error(error);
        }
      });
    });
  }

  markMessagesAsRead(conversationId: string, currentUserId: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    
    return this.http.post<any>(`${this.apiUrl}/messages/read`, null, {
      headers: headers,
      params: {
        conversationId: conversationId,
        userId: currentUserId
      }
    });
  }

  clearConversationsCache(username?: string): void {
    if (username) {
      this.conversationsCache.delete(username);
    } else {
      this.conversationsCache.clear();
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.activeSubscriptions.clear();
      this.isConnected = false;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
