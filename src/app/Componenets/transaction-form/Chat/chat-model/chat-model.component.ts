import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Transaction } from '../../../../Model/transaction';
import { ChatMessage, ChatService } from '../../../../Service/Chat/chat.service';

@Component({
  selector: 'app-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
         (click)="onBackdropClick($event)">
      <div class="bg-white rounded-lg w-full max-w-2xl shadow-2xl" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="border-b border-gray-200 p-4 flex justify-between items-center bg-blue-600 text-white rounded-t-lg">
          <div>
            <h3 class="text-xl font-semibold">💬 Chat with {{ transaction.userId }}</h3>
            <p class="text-sm text-blue-100">
              Transaction #{{ getTransactionId() || 'N/A' }} - \${{ transaction.amount | number:'1.2-2' }}
            </p>
          </div>
          <button (click)="close.emit()" class="text-white hover:text-gray-200 text-3xl font-light leading-none">
            ×
          </button>
        </div>

        <!-- Messages -->
        <div #scrollContainer class="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
          <div *ngFor="let msg of messages" 
               [ngClass]="msg.sender === 'admin' ? 'flex justify-end' : 'flex justify-start'">
            <div [ngClass]="msg.sender === 'admin' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-800'"
                 class="max-w-xs px-4 py-2 rounded-lg shadow">
              <p class="font-semibold text-sm mb-1">{{ msg.senderName }}</p>
              <p class="break-words">{{ msg.message }}</p>
              <p class="text-xs opacity-70 mt-1">{{ formatTime(msg.timestamp) }}</p>
            </div>
          </div>

          <div *ngIf="messages.length === 0" class="text-center text-gray-500 mt-8">
            <div class="text-6xl mb-4">💬</div>
            <p class="font-semibold">No messages yet</p>
            <p class="text-sm">Start the conversation!</p>
          </div>
        </div>

        <!-- Input -->
        <div class="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          <div class="flex gap-2">
            <input
              type="text"
              [(ngModel)]="newMessage"
              (keypress)="onKeyPress($event)"
              placeholder="Type your message..."
              class="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              [disabled]="isSending"
            />
            <button
              (click)="sendMessage()"
              [disabled]="!newMessage.trim() || isSending || !canSendMessages()"
              class="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition whitespace-nowrap">
              {{ isSending ? 'Sending...' : 'Send' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Tailwind utilities */
    .fixed { position: fixed; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .bg-black { background-color: rgb(0, 0, 0); }
    .bg-opacity-50 { --tw-bg-opacity: 0.5; background-color: rgb(0 0 0 / var(--tw-bg-opacity)); }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .justify-start { justify-content: flex-start; }
    .z-50 { z-index: 50; }
    .p-4 { padding: 1rem; }
    .bg-white { background-color: rgb(255, 255, 255); }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-t-lg { border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; }
    .rounded-b-lg { border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
    .w-full { width: 100%; }
    .max-w-2xl { max-width: 42rem; }
    .max-w-xs { max-width: 20rem; }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
    .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
    .border-b { border-bottom-width: 1px; }
    .border-t { border-top-width: 1px; }
    .border { border-width: 1px; }
    .border-gray-200 { border-color: rgb(229, 231, 235); }
    .border-gray-300 { border-color: rgb(209, 213, 219); }
    .bg-blue-600 { background-color: rgb(37, 99, 235); }
    .bg-blue-500 { background-color: rgb(59, 130, 246); }
    .hover\\:bg-blue-600:hover { background-color: rgb(37, 99, 235); }
    .text-white { color: rgb(255, 255, 255); }
    .hover\\:text-gray-200:hover { color: rgb(229, 231, 235); }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-6xl { font-size: 3.75rem; line-height: 1; }
    .font-semibold { font-weight: 600; }
    .font-light { font-weight: 300; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .leading-none { line-height: 1; }
    .text-blue-100 { color: rgb(219, 234, 254); }
    .h-96 { height: 24rem; }
    .overflow-y-auto { overflow-y: auto; }
    .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
    .bg-gray-50 { background-color: rgb(249, 250, 251); }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .text-gray-800 { color: rgb(31, 41, 55); }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-8 { margin-top: 2rem; }
    .opacity-70 { opacity: 0.7; }
    .text-center { text-align: center; }
    .text-gray-500 { color: rgb(107, 114, 128); }
    .gap-2 { gap: 0.5rem; }
    .flex-1 { flex: 1 1 0%; }
    .outline-none { outline: 2px solid transparent; outline-offset: 2px; }
    .focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgb(59 130 246 / 0.5); }
    .focus\\:ring-blue-500:focus { --tw-ring-color: rgb(59, 130, 246); }
    .focus\\:border-transparent:focus { border-color: transparent; }
    .disabled\\:bg-gray-300:disabled { background-color: rgb(209, 213, 219); }
    .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
    .transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .break-words { overflow-wrap: break-word; }
    .whitespace-nowrap { white-space: nowrap; }
  `]
})
export class ChatModalComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() transaction!: Transaction;
  @Output() close = new EventEmitter<void>();
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  isSending = false;
  private subscription?: Subscription;
  private shouldScrollToBottom = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    const transactionId = this.getTransactionId();
    console.log('💬 Chat modal opened for transaction:', transactionId);
    
    // Only fetch history if ID exists
    if (transactionId) {
      this.chatService.getChatHistory(transactionId).subscribe({
        next: (history: any) => {
          // Handle both array and object responses
          const messages = Array.isArray(history) ? history : (history.messages || []);
          console.log(`📜 Loaded ${messages.length} chat messages`);
          this.messages = messages;
          this.shouldScrollToBottom = true;
        },
        error: (err: any) => console.error('❌ Failed to load chat history:', err)
      });

      // Subscribe to new messages
      this.subscription = this.chatService.subscribeToChat(transactionId).subscribe({
        next: (msg: ChatMessage) => {
          console.log('📨 New chat message received:', msg);
          this.messages.push(msg);
          this.shouldScrollToBottom = true;
        },
        error: (err: any) => console.error('❌ Chat subscription error:', err)
      });
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    console.log('💬 Chat modal closed');
    this.subscription?.unsubscribe();
  }

  sendMessage(): void {
    const transactionId = this.getTransactionId();

    if (!this.newMessage.trim() || this.isSending || !transactionId) return;

    this.isSending = true;
    const messageText = this.newMessage.trim();
    this.newMessage = '';

    console.log('📤 Sending message:', messageText);

    // Add message to UI immediately
    const sentMessage: ChatMessage = {
      transactionId,
      sender: 'admin',
      senderName: 'Admin Support',
      message: messageText,
      timestamp: new Date()
    };

    this.messages.push(sentMessage);

    this.chatService.sendMessage(
      transactionId,
      'admin',
      'Admin Support',
      messageText
    );

    this.isSending = false;
    this.shouldScrollToBottom = true;
  }

  canSendMessages(): boolean {
    return !!this.getTransactionId();
  }

  getTransactionId(): number | null {
    return this.transaction?.id || null;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    this.close.emit();
  }

  formatTime(timestamp?: Date): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        const element = this.scrollContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
