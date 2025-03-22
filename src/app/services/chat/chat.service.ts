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
    
    const message = {
      sender: sender,
      recipient: recipient,
      content: text,
      timestamp: new Date().toISOString()
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
