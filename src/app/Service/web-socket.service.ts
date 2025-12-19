import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Transaction } from '../Model/transaction';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private readonly WS_URL = 'http://localhost:8080/ws';

  // Shared persistent data
  public transactions: Transaction[] = [];
  public dashboardStats = { safe: 0, fraud: 0, pending: 0 };
  public recentTransactions: Transaction[] = [];

  public transactionSubject = new Subject<Transaction>();

  constructor(private ngZone: NgZone) {
    this.connect();
  }

  private connect(): void {
    if (this.stompClient?.connected) {
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.WS_URL) as any,
      debug: (str) => console.log('STOMP Debug:', str),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      console.log('✅ STOMP Connected');

      this.stompClient?.subscribe('/topic/transactions', (message: IMessage) => {
        try {
          const transaction: Transaction = JSON.parse(message.body);
          console.log('📥 WEBSOCKET SERVICE RECEIVED MESSAGE:', transaction);

          this.ngZone.run(() => {
            this.addTransaction(transaction);  // Central handling
            this.transactionSubject.next(transaction);
          });
        } catch (error) {
          console.error('Parse error:', error);
        }
      });
    };

    this.stompClient.activate();
  }

  private addTransaction(txn: Transaction): void {
    this.transactions.unshift(txn);

    // Keep only last 50 full
    if (this.transactions.length > 50) {
      this.transactions.pop();
    }

    // Update recent
    this.recentTransactions = this.transactions.slice(0, 10);

    // Update stats
    if (txn.status === 'REJECTED') {
      this.dashboardStats.fraud++;
    } else if (txn.status === 'APPROVED') {
      this.dashboardStats.safe++;
    } else {
      this.dashboardStats.pending++;
    }

    console.log('Shared service updated - total:', this.transactions.length, 'stats:', this.dashboardStats);
  }
}