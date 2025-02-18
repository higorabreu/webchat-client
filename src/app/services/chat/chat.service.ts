import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as Stomp from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private stompClient: Stomp.Client | null = null;
  private messagesSubject: Subject<any> = new Subject<any>();
  private token: string | null = localStorage.getItem('token');

  constructor() {}

  connect(user: string, conversationId: string): void {
    if (this.stompClient && this.stompClient.connected) {
      console.log('Já conectado ao WebSocket.');
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
    const destination = `/user/queue/messages/${conversationId}`;
    this.stompClient?.subscribe(destination, (message: any) => {
      console.log('Mensagem recebida:', message.body);
      this.messagesSubject.next(JSON.parse(message.body));
    });
  }

  sendMessage(user: string, recipient: string, message: string): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          sender: user,
          recipient: recipient,
          text: message,
          timestamp: new Date().toISOString(),
        }),
      });
    } else {
      console.error('WebSocket não está conectado.');
    }
  }

  getMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
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
}
