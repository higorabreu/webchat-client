import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as Stomp from '@stomp/stompjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getCurrentUserId } from '../../utils/utils';

export interface Conversation {
  id: string;
  userId: string;
  username: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
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

  constructor(private http: HttpClient) {}

  connect(user: string, conversationId: string): void {
    if (this.stompClient && this.stompClient.connected) {
      console.log('Já conectado ao WebSocket.');
      this.subscribeToMessages(conversationId);
      return;
    }

    this.stompClient = new Stomp.Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        Authorization: `Bearer ${this.token}`
      },
      onConnect: () => {
        console.log('Conectado ao WebSocket.');
        this.subscribeToMessages(conversationId);
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

  private subscribeToMessages(conversationId: string): void {
    if (!this.stompClient?.connected) {
      console.error('Não é possível se inscrever: WebSocket não está conectado.');
      return;
    }
    
    const destination = `/user/queue/messages/${conversationId}`;
    console.log(`Inscrevendo-se em: ${destination}`);
    
    this.stompClient.subscribe(destination, (message: any) => {
      console.log('Mensagem recebida:', message.body);
      try {
        const parsedMessage = JSON.parse(message.body);
        this.messagesSubject.next(parsedMessage);
      } catch (error) {
        console.error('Erro ao processar mensagem recebida:', error);
      }
    });
  }

  sendMessage(sender: string, recipient: string, text: string): void {
    if (!this.stompClient?.connected) {
      console.error('WebSocket não está conectado.');
      return;
    }
    
    // Enviar o timezone atual do cliente para o servidor
    const message = {
      sender: sender,
      recipient: recipient,
      content: text,
      senderUsername: sender,
      recipientUsername: recipient,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Obtém o timezone do navegador
    };
    
    console.log('Enviando mensagem:', message);
    
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
      console.error('ID do usuário não encontrado no token.');
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
          console.error('Erro ao buscar conversas:', error);
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
      console.log('Desconectado do WebSocket');
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  generateConversationId(user1: string, user2: string): string {
    return user1.localeCompare(user2) < 0 ? 
      `${user1}-${user2}` : 
      `${user2}-${user1}`;
  }
}
