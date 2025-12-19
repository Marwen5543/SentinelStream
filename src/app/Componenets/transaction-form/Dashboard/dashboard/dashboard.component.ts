import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Transaction } from '../../../../Model/transaction';
import { WebSocketService } from '../../../../Service/web-socket.service';
import { Subscription } from 'rxjs';
import { ChatModalComponent } from '../../Chat/chat-model/chat-model.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChatModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  dashboardStats = { safe: 0, fraud: 0, pending: 0 };
  recentTransactions: Transaction[] = [];
  
  // Chat modal state
  showChatModal = false;
  selectedTransaction: Transaction | null = null;

  private subscription!: Subscription;

  constructor(private wsService: WebSocketService) {
    console.log('🟢 DashboardComponent constructor called');
  }

  ngOnInit(): void {
    console.log('🟢 DashboardComponent ngOnInit - subscribing to transactionSubject');

    // ✅ LOAD EXISTING TRANSACTIONS FROM SERVICE ON INIT
    this.loadExistingTransactions();

    // ✅ SUBSCRIBE TO NEW INCOMING TRANSACTIONS
    this.subscription = this.wsService.transactionSubject.subscribe((txn: Transaction) => {
      console.log('📥 DASHBOARD RECEIVED NEW TRANSACTION:', txn);

      if (txn) {
        console.log('Processing transaction for user:', txn.userId, 'Status:', txn.status);
        this.handleNewTransaction(txn);
      } else {
        console.warn('Received null/undefined transaction');
      }
    });

    console.log('Subscription active. Waiting for transactions...');
  }

  /**
   * Load all existing transactions from the WebSocket service when component initializes
   */
  loadExistingTransactions() {
    console.log('📦 Loading existing transactions from service...');
    
    // Get all transactions from the service
    this.transactions = [...this.wsService.recentTransactions];
    
    // Update recent transactions (last 10)
    this.recentTransactions = this.transactions.slice(0, 10);
    
    // Recalculate stats from existing transactions
    this.recalculateStats();
    
    console.log(`✅ Loaded ${this.transactions.length} existing transactions`);
    console.log('Current stats:', this.dashboardStats);
  }

  /**
   * Recalculate dashboard statistics from the current transaction list
   */
  recalculateStats() {
    this.dashboardStats = { safe: 0, fraud: 0, pending: 0 };
    
    this.transactions.forEach(txn => {
      if (txn.status === 'REJECTED') {
        this.dashboardStats.fraud++;
      } else if (txn.status === 'APPROVED') {
        this.dashboardStats.safe++;
      } else {
        this.dashboardStats.pending++;
      }
    });
  }

  handleNewTransaction(txn: Transaction) {
    console.log('handleNewTransaction called - adding to list');

    this.transactions.unshift(txn);
    console.log('Full transactions list length now:', this.transactions.length);

    this.recentTransactions = this.transactions.slice(0, 10);
    console.log('recentTransactions updated - showing last 10:', this.recentTransactions.length);

    if (txn.status === 'REJECTED') {
      this.dashboardStats.fraud++;
      console.log('Fraud counter increased →', this.dashboardStats.fraud);
    } else if (txn.status === 'APPROVED') {
      this.dashboardStats.safe++;
      console.log('Safe counter increased →', this.dashboardStats.safe);
    } else {
      this.dashboardStats.pending++;
      console.log('Pending counter increased →', this.dashboardStats.pending);
    }

    console.log('Current stats:', this.dashboardStats);
  }

  /**
   * Open chat modal for a specific transaction
   */
  openChat(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.showChatModal = true;
    console.log('💬 Opening chat for transaction:', transaction.id);
  }

  /**
   * Close chat modal
   */
  closeChat(): void {
    this.showChatModal = false;
    this.selectedTransaction = null;
    console.log('💬 Chat modal closed');
  }

  ngOnDestroy(): void {
    console.log('DashboardComponent destroyed - unsubscribing');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}