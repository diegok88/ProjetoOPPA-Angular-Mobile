import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  imports: [MatButtonModule],
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss',
})
export class AccessDenied {
  private router = inject(Router);

  protected voltarLogin(): void {
    this.router.navigate(['/login-user']);
  }
}
