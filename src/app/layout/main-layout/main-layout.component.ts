import { Component, ViewChild, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        [fixedInViewport]="isMobile()"
        class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="sidenav-logo">electrical_services</mat-icon>
          <span class="sidenav-title">Electrimundo</span>
        </div>
        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active-link"
               (click)="onNavClick(sidenav)">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="onLogout()" class="logout-sidebar-btn">
            <mat-icon>logout</mat-icon>
            <span>Cerrar Sesi&oacute;n</span>
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          @if (isMobile()) {
            <button mat-icon-button (click)="sidenav.toggle()" aria-label="Men&uacute;">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="toolbar-title">ERP Electrimundo</span>
          <span class="toolbar-spacer"></span>
          <span class="user-name">{{ userName() }}</span>
          <button mat-icon-button (click)="onLogout()" matTooltip="Cerrar sesi&oacute;n">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 260px;
      background: #1a237e;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .sidenav-logo {
      color: white;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .sidenav-title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    mat-nav-list a {
      color: rgba(255, 255, 255, 0.85) !important;
      margin: 4px 8px;
      border-radius: 8px !important;
    }

    mat-nav-list a:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }

    mat-nav-list a.active-link {
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
    }

    mat-nav-list a mat-icon {
      color: rgba(255, 255, 255, 0.85) !important;
    }

    .sidenav-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    .logout-sidebar-btn {
      color: rgba(255, 255, 255, 0.85) !important;
      width: 100%;
      justify-content: flex-start;
      gap: 8px;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-title {
      margin-left: 8px;
      font-size: 18px;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .user-name {
      font-size: 14px;
      margin-right: 8px;
      display: none;
    }

    .content {
      padding: 24px;
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
    }

    @media (min-width: 600px) {
      .user-name {
        display: inline;
      }
    }

    @media (max-width: 599px) {
      .content {
        padding: 16px;
      }

      .toolbar-title {
        font-size: 16px;
      }
    }
  `],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly isMobile = signal(false);
  readonly userName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return user.firstName ? `${user.firstName} ${user.lastName}` : user.username;
  });

  readonly navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'people', label: 'Usuarios', route: '/usuarios' },
    { icon: 'inventory_2', label: 'Productos', route: '/productos' },
    { icon: 'point_of_sale', label: 'Ventas', route: '/ventas' },
    { icon: 'assessment', label: 'Reportes', route: '/reportes' },
    { icon: 'settings', label: 'Configuraci\u00f3n', route: '/configuracion' },
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isMobile.set(result.matches);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNavClick(sidenav: MatSidenav): void {
    if (this.isMobile()) {
      sidenav.close();
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
