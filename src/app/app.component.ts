// File: src/app/app.component.ts
// IMPORTANT: Use "template" (inline), NOT "templateUrl" (external file)

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `<router-outlet></router-outlet>`,  
  styleUrls: ['./app.component.css']            
})
export class AppComponent {
  title = 'sentinel-dashboard';
}