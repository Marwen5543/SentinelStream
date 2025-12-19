import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../Model/transaction';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css'
})
export class TransactionFormComponent {
  transaction: Transaction = {
    userId: '',
    amount: 0,
    currency: 'USD',
    merchant: '',
    location: '',
    status: 'PENDING',
    aiAnalysis: ''
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  private readonly API_URL = 'http://localhost:8080/api/transactions';

  constructor(private http: HttpClient) {}

  onSubmit(): void {
    if (this.isSubmitting) return;

    // Validation
    if (!this.transaction.userId || !this.transaction.amount || 
        !this.transaction.merchant || !this.transaction.location) {
      this.errorMessage = 'Please fill in all fields';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (this.transaction.amount <= 0) {
      this.errorMessage = 'Amount must be greater than 0';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Send to backend
    this.http.post(this.API_URL, this.transaction, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          this.successMessage = '✅ Transaction submitted successfully!';
          this.resetForm();
          this.isSubmitting = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = '❌ Failed to submit transaction: ' + error.message;
          this.isSubmitting = false;
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }

  resetForm(): void {
    this.transaction = {
      userId: '',
      amount: 0,
      currency: 'USD',
      merchant: '',
      location: '',
      status: 'PENDING',
      aiAnalysis: ''
    };
  }

  // Updated sample data with both legitimate and fraudulent transactions
  fillSampleData(): void {
    const samples = [
      // ✅ LEGITIMATE TRANSACTIONS
      { userId: 'Ahmed', amount: 45.50, merchant: 'Amazon Books', location: 'Tunis', currency: 'TND' },
      { userId: 'Sarah', amount: 25.99, merchant: 'Coffee Shop', location: 'New York', currency: 'USD' },
      { userId: 'John', amount: 120.00, merchant: 'Gas Station', location: 'London', currency: 'GBP' },
      { userId: 'Maria', amount: 89.99, merchant: 'Restaurant', location: 'Tokyo', currency: 'JPY' },
      { userId: 'Ali', amount: 12.50, merchant: 'Grocery Store', location: 'Cairo', currency: 'USD' },
      
      // 🚨 FRAUDULENT TRANSACTIONS
      { userId: 'Suspect1', amount: 8000.00, merchant: 'Luxury Store', location: 'Paris', currency: 'EUR' },
      { userId: 'Suspect2', amount: 5000.00, merchant: 'Jewelry Shop', location: 'Dubai', currency: 'USD' },
      { userId: 'Suspect3', amount: 15000.00, merchant: 'Casino Royal', location: 'Las Vegas', currency: 'USD' },
      { userId: 'Suspect4', amount: 10000.00, merchant: 'Crypto Exchange', location: 'Unknown', currency: 'USD' },
      { userId: 'Suspect5', amount: 7500.00, merchant: 'Electronics Mega Store', location: 'Lagos', currency: 'USD' },
      { userId: 'Suspect6', amount: 3000.00, merchant: 'Rolex Boutique', location: 'Geneva', currency: 'USD' },
      { userId: 'Suspect7', amount: 12000.00, merchant: 'Bitcoin ATM', location: 'Russia', currency: 'USD' },
      { userId: 'Suspect8', amount: 4500.00, merchant: 'Gucci Store', location: 'Milan', currency: 'EUR' }
    ];
    
    const sample = samples[Math.floor(Math.random() * samples.length)];
    this.transaction = { ...this.transaction, ...sample };
  }
}