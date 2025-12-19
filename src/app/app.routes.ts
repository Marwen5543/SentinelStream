import { Routes } from '@angular/router';
import { DashboardComponent } from './Componenets/transaction-form/Dashboard/dashboard/dashboard.component';
import { HomeComponent } from './Componenets/home/home/home.component';
import { TransactionFormComponent } from './Componenets/transaction-form/transaction-form.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'transaction', component: TransactionFormComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' }
];
