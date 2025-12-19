import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Transaction } from '../../../Model/transaction';
import { WebSocketService } from '../../../Service/web-socket.service';
import { TransactionFormComponent } from "../../transaction-form/transaction-form.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home', // or 'app-dashboard' for the other component
  standalone: true,
  imports: [CommonModule, RouterModule, TransactionFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  title = 'sentinel-dashboard';

  transactions: Transaction[] = [];
  stats = { safe: 0, fraud: 0, pending: 0 };

  private subscription!: Subscription;

  constructor(private wsService: WebSocketService) {}

  ngOnInit(): void {
    // NO this.wsService.connect(); — connection is automatic in service constructor

    this.subscription = this.wsService.transactionSubject.subscribe((txn: Transaction) => {
      if (txn) {
        this.handleNewTransaction(txn);
      }
    });
  }

  handleNewTransaction(txn: Transaction): void {
    // Add new transaction to the top
    this.transactions.unshift(txn);

    // Limit to last 50 to prevent memory growth
    if (this.transactions.length > 50) {
      this.transactions.pop();
    }

    // Update statistics
    if (txn.status === 'REJECTED') {
      this.stats.fraud++;
    } else if (txn.status === 'APPROVED') {
      this.stats.safe++;
    } else if (txn.status === 'PENDING') {
      this.stats.pending++;
    }
  }

  ngOnDestroy(): void {
    // Only unsubscribe from the subject — do NOT disconnect the WebSocket
    // REMOVE this.wsService.disconnect();
    console.log('DashboardComponent destroyed - keeping subscription alive');
  }
}