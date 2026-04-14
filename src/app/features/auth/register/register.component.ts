import { Component, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword
    ? { passwordsMismatch: true }
    : null;
}

@Component({
  selector: 'app-register',
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
    <div class="register-container">
      <div class="register-card-wrapper">
        <mat-card class="register-card">
          <mat-card-header>
            <div class="register-header">
              <mat-icon class="brand-icon">electrical_services</mat-icon>
              <h1 class="brand-title">ERP Electrimundo</h1>
              <p class="brand-subtitle">Crear nueva cuenta</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <div class="row-fields">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Nombre</mat-label>
                  <input matInput formControlName="firstName" placeholder="Juan" autocomplete="given-name">
                  <mat-icon matPrefix>badge</mat-icon>
                  @if (registerForm.get('firstName')?.hasError('required') && registerForm.get('firstName')?.touched) {
                    <mat-error>El nombre es requerido</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Apellido</mat-label>
                  <input matInput formControlName="lastName" placeholder="Pérez" autocomplete="family-name">
                  <mat-icon matPrefix>badge</mat-icon>
                  @if (registerForm.get('lastName')?.hasError('required') && registerForm.get('lastName')?.touched) {
                    <mat-error>El apellido es requerido</mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Usuario</mat-label>
                <input matInput formControlName="username" placeholder="juanperez" autocomplete="username">
                <mat-icon matPrefix>person</mat-icon>
                @if (registerForm.get('username')?.hasError('required') && registerForm.get('username')?.touched) {
                  <mat-error>El nombre de usuario es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" placeholder="juan@correo.com" autocomplete="email" type="email">
                <mat-icon matPrefix>email</mat-icon>
                @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                  <mat-error>El email es requerido</mat-error>
                }
                @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                  <mat-error>El email no es válido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" autocomplete="new-password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix (click)="hidePassword.update(v => !v)" type="button">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                  <mat-error>La contraseña es requerida</mat-error>
                }
                @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                  <mat-error>Mínimo 8 caracteres</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmar contraseña</mat-label>
                <input matInput [type]="hideConfirm() ? 'password' : 'text'" formControlName="confirmPassword" autocomplete="new-password">
                <mat-icon matPrefix>lock_reset</mat-icon>
                <button mat-icon-button matSuffix (click)="hideConfirm.update(v => !v)" type="button">
                  <mat-icon>{{ hideConfirm() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (registerForm.get('confirmPassword')?.touched && registerForm.hasError('passwordsMismatch')) {
                  <mat-error>Las contraseñas no coinciden</mat-error>
                }
              </mat-form-field>

              @if (errorMessage()) {
                <div class="error-message">
                  <mat-icon>error_outline</mat-icon>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              @if (successMessage()) {
                <div class="success-message">
                  <mat-icon>check_circle</mat-icon>
                  <span>{{ successMessage() }}</span>
                </div>
              }

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="register-button full-width"
                [disabled]="isLoading() || registerForm.invalid">
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                  Registrando...
                } @else {
                  <mat-icon>person_add</mat-icon>
                  Crear Cuenta
                }
              </button>

              <div class="login-link">
                ¿Ya tienes cuenta?
                <a routerLink="/login">Iniciar sesión</a>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
        <p class="footer-text">&copy; 2024 Electrimundo - Todos los derechos reservados</p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
      padding: 16px;
    }

    .register-card-wrapper {
      width: 100%;
      max-width: 480px;
    }

    .register-card {
      padding: 32px 24px;
      border-radius: 16px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    }

    .register-header {
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

    .row-fields {
      display: flex;
      gap: 12px;
    }

    .half-width {
      flex: 1;
    }

    mat-form-field {
      margin-bottom: 4px;
    }

    .register-button {
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

    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #2e7d32;
      background: #e8f5e9;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .success-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .login-link {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
      color: #555;
    }

    .login-link a {
      color: #1a237e;
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    .footer-text {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      margin-top: 24px;
    }

    @media (max-width: 480px) {
      .register-card {
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

      .row-fields {
        flex-direction: column;
        gap: 0;
      }
    }
  `],
})
export class RegisterComponent {
  readonly hidePassword = signal(true);
  readonly hideConfirm = signal(true);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  registerForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        username: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordsMatch },
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { confirmPassword, ...data } = this.registerForm.value;

    this.authService.register(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Cuenta creada exitosamente. Redirigiendo al login...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message ?? 'Error al crear la cuenta. Intente nuevamente.',
        );
      },
    });
  }
}
