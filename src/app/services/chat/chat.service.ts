import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';
import * as Stomp from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private stompClient: Stomp.Client | null = null;
  private messagesSubject: Subject<any> = new Subject<any>();

  constructor() {}

  connect(user: string, conversationId: string): void {
    if (this.stompClient && this.stompClient.connected) {
      console.log('Já conectado ao WebSocket.');
      return;
    }

    this.stompClient = new Stomp.Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: (str: string) => console.log(str),
      connectHeaders: {},
      onConnect: () => {
        console.log('Conectado ao WebSocket');
        this.subscribeToMessages(user, conversationId);
      },
      onStompError: (frame: any) => {
        console.error('Erro STOMP', frame);
      },
    });

    this.stompClient.activate();
  }

  private subscribeToMessages(user: string, conversationId: string): void {
    const destination = `/user/${user}/queue/messages/${conversationId}`;
    this.stompClient?.subscribe(destination, (message: any) => {
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
