import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-card-wrapper">
        <mat-card class="login-card">
          <mat-card-header>
            <div class="login-header">
              <mat-icon class="brand-icon">electrical_services</mat-icon>
              <h1 class="brand-title">ERP Electrimundo</h1>
              <p class="brand-subtitle">Sistema de Gesti&oacute;n Empresarial</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Usuario o Email</mat-label>
                <input matInput formControlName="login" placeholder="usuario@correo.com" autocomplete="username">
                <mat-icon matPrefix>person</mat-icon>
                @if (loginForm.get('login')?.hasError('required') && loginForm.get('login')?.touched) {
                  <mat-error>El usuario o email es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contrase&ntilde;a</mat-label>
                <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" autocomplete="current-password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix (click)="togglePasswordVisibility()" type="button" [attr.aria-label]="'Mostrar contrase\u00f1a'">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                  <mat-error>La contrase&ntilde;a es requerida</mat-error>
                }
              </mat-form-field>

              @if (errorMessage()) {
                <div class="error-message">
                  <mat-icon>error_outline</mat-icon>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="login-button full-width"
                [disabled]="isLoading() || loginForm.invalid">
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                  Ingresando...
                } @else {
                  <ng-container>
                    <mat-icon>login</mat-icon>
                    Iniciar Sesi&oacute;n
                  </ng-container>
                }
              </button>
              <div class="register-link">
                ¿No tienes cuenta?
                <a routerLink="/register">Crear una cuenta</a>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
        <p class="footer-text">&copy; 2024 Electrimundo - Todos los derechos reservados</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
      padding: 16px;
    }

    .login-card-wrapper {
      width: 100%;
      max-width: 420px;
    }

    .login-card {
      padding: 32px 24px;
      border-radius: 16px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    }

    .login-header {
      text-align: center;
      width: 100%;
      margin-bottom: 24px;
    }

    .brand-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1a237e;
      margin-bottom: 8px;
    }

    .brand-title {
      font-size: 24px;
      font-weight: 700;
      color: #1a237e;
      margin: 0 0 4px 0;
    }

    .brand-subtitle {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    mat-card-header {
      display: flex;
      justify-content: center;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    .login-button {
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      margin-top: 8px;
      border-radius: 8px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .button-spinner {
      display: inline-block;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d32f2f;
      background: #ffebee;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .register-link {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
      color: #555;
    }

    .register-link a {
      color: #1a237e;
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    .footer-text {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      margin-top: 24px;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 24px 16px;
      }

      .brand-title {
        font-size: 20px;
      }

      .brand-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }
    }
  `],
})
export class LoginComponent {
  readonly hidePassword = signal(true);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  loginForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message ?? 'Error al iniciar sesi\u00f3n. Verifique sus credenciales.',
        );
      },
    });
  }
}
