import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ChatMessage {
  id?: number;
  transactionId: number;
  sender: string; // 'admin' or 'user'
  senderName: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: Client | null = null;
  private chatSubjects = new Map<number, Subject<ChatMessage>>();
  private readonly baseUrl = 'http://localhost:8080'; // Adjust to your backend URL

  constructor() {
    this.initializeWebSocketConnection();
  }

  /**
   * Initialize WebSocket connection for chat
   */
  private initializeWebSocketConnection(): void {
    const socket = new SockJS(`${this.baseUrl}/ws`);
    
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      debug: (str) => {
        console.log('STOMP Chat Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.stompClient.onConnect = () => {
      console.log('✅ Chat WebSocket Connected');
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ Chat STOMP Error:', frame);
    };

    this.stompClient.activate();
  }

  /**
   * Subscribe to chat messages for a specific transaction
   */
  subscribeToChat(transactionId: number): Observable<ChatMessage> {
    if (!this.chatSubjects.has(transactionId)) {
      const subject = new Subject<ChatMessage>();
      this.chatSubjects.set(transactionId, subject);

      // Subscribe to the transaction-specific topic
      if (this.stompClient && this.stompClient.connected) {
        this.subscribeToChatTopic(transactionId, subject);
      } else {
        // Wait for connection then subscribe
          if (this.stompClient) {
            this.stompClient.onConnect = () => {
              console.log('✅ Chat WebSocket Connected');
              this.subscribeToChatTopic(transactionId, subject);
            };
          }
      }
    }

    return this.chatSubjects.get(transactionId)!.asObservable();
  }

  /**
   * Subscribe to the STOMP topic for a transaction
   */
  private subscribeToChatTopic(transactionId: number, subject: Subject<ChatMessage>): void {
    this.stompClient?.subscribe(`/topic/chat/${transactionId}`, (message: IMessage) => {
      const chatMessage: ChatMessage = JSON.parse(message.body);
      console.log('📨 Chat message received:', chatMessage);
      subject.next(chatMessage);
    });
  }

  /**
   * Send a chat message
   */
  sendMessage(
    transactionId: number,
    sender: string,
    senderName: string,
    message: string
  ): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('❌ WebSocket not connected');
      return;
    }

    const chatMessage: ChatMessage = {
      transactionId,
      sender,
      senderName,
      message,
      timestamp: new Date()
    };

    console.log('📤 Sending chat message:', chatMessage);

    this.stompClient.publish({
      destination: `/app/chat/${transactionId}`,
      body: JSON.stringify(chatMessage)
    });
  }

  /**
   * Get chat history for a transaction from backend
   */
  getChatHistory(transactionId: number): Observable<ChatMessage[]> {
    return new Observable(observer => {
      // Make HTTP request to get chat history
      fetch(`${this.baseUrl}/api/chat/history/${transactionId}`)
        .then(response => response.json())
        .then((history: ChatMessage[]) => {
          observer.next(history);
          observer.complete();
        })
        .catch(error => {
          console.error('Failed to fetch chat history:', error);
          // Return empty array on error
          observer.next([]);
          observer.complete();
        });
    });
  }

  /**
   * Cleanup on service destroy
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('Chat WebSocket disconnected');
    }
    
    this.chatSubjects.forEach(subject => subject.complete());
    this.chatSubjects.clear();
  }
}