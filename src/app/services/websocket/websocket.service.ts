import { Injectable, OnDestroy } from '@angular/core';
import * as Stomp from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private stompClient: Stomp.Client | null = null;
  private messagesSubject: Subject<any> = new Subject<any>();
  private token: string | null = localStorage.getItem('token');
  private activeSubscriptions: Set<string> = new Set();
  private isConnected: boolean = false;

  constructor() {}

  connect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.isConnected = true;
      return;
    }

    this.stompClient = new Stomp.Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        Authorization: `Bearer ${this.token}`,
      },
      onConnect: () => {
        this.isConnected = true;
      },
    });

    this.stompClient.activate();
  }

  subscribeToMessages(conversationId: string): void {
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

  sendMessage(message: any): void {
    if (!this.stompClient?.connected) {
      return;
    }

    this.stompClient.publish({
      destination: '/app/chat.send',
      headers: {
        Authorization: `Bearer ${this.token}`,
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
      this.activeSubscriptions.clear();
      this.isConnected = false;
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
