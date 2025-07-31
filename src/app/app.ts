import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VpcListComponent } from './vpc-list';
import { VpcDetailsComponent } from './vpc-details';
import { VpcWizardComponent } from './vpc-wizard';

const CLIENT_ID = '1088207411647-8ujqtd2jv7o8vi67hh94g0996a9aspqq.apps.googleusercontent.com'; // TODO: Replace with your OAuth2 Client ID
const SCOPES = 'https://www.googleapis.com/auth/compute https://www.googleapis.com/auth/cloud-platform openid email profile';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, VpcListComponent, VpcDetailsComponent, VpcWizardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'VibeCoding GCP Console';
  user: any = null;
  token: string | null = null;
  vms: any[] = [];
  error: string | null = null;
  currentPage: 'vm-list' | 'vpc-list' | 'vpc-details' | 'vpc-wizard' = 'vm-list';

  project: string = 'firewalls-order';
  zone: string = 'us-central1-a';
  showPermissionNotification = true; // Show by default to inform users about the permission change

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Check for existing token in localStorage
    const existingToken = localStorage.getItem('gcp_token');
    if (existingToken) {
      this.token = existingToken;
      this.getUserInfo();
    }
    
    // Check URL parameters for page routing
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page === 'vpc-details') {
      this.currentPage = 'vpc-details';
    } else if (page === 'vpc-wizard') {
      this.currentPage = 'vpc-wizard';
    }
    
    // Check if user has dismissed the notification
    const dismissed = localStorage.getItem('permission_notification_dismissed');
    if (dismissed) {
      this.showPermissionNotification = false;
    }
    
    // Wait for gapi to load, then initialize
    (window as any).onGapiLoad = () => {
      (window as any).gapi.load('client', () => {
        (window as any).gapi.client.init({
          apiKey: '', // Not needed for OAuth2
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/compute/v1/rest'
          ]
        });
      });
    };
    // If gapi is already loaded
    if ((window as any).gapi) {
      (window as any).onGapiLoad();
    } else {
      // Wait for gapi to load
      const checkGapi = setInterval(() => {
        if ((window as any).gapi) {
          clearInterval(checkGapi);
          (window as any).onGapiLoad();
        }
      }, 100);
    }
  }

  login() {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          this.token = tokenResponse.access_token;
          // Store token in localStorage for VPC component to use
          if (this.token) {
            localStorage.setItem('gcp_token', this.token);
          }
          this.getUserInfo();
          // Force change detection
          this.cdr.detectChanges();
        } else {
          this.error = 'Failed to get access token.';
          this.cdr.detectChanges();
        }
      }
    });
    client.requestAccessToken();
  }

  logout() {
    this.user = null;
    this.token = null;
    this.vms = [];
    this.error = null;
    localStorage.removeItem('gcp_token');
    this.cdr.detectChanges();
  }

  // Force re-authentication with new scopes
  forceReauth() {
    this.logout();
    this.login();
  }

  getUserInfo() {
    if (!this.token) return;
    fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${this.token}` }
    })
      .then(res => res.json())
      .then(data => {
        this.user = data;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.error = 'Failed to fetch user info.';
        this.cdr.detectChanges();
      });
  }

  async listVMs() {
    if (!this.token) return;
    try {
      const gapi = (window as any).gapi;
      
      // Ensure the Compute API is loaded
      if (!gapi.client.compute) {
        await new Promise<void>((resolve) => {
          gapi.client.load('compute', 'v1', () => {
            resolve();
          });
        });
      }
      
      gapi.client.setToken({ access_token: this.token });
      const resp = await gapi.client.compute.instances.list({ project: this.project, zone: this.zone });
      this.vms = resp.result.items || [];
      this.error = null;
      this.cdr.detectChanges();
    } catch (err: any) {
      this.error = 'Failed to fetch VMs: ' + (err.message || err);
      this.cdr.detectChanges();
    }
  }

  navigateToVpcList() {
    this.currentPage = 'vpc-list';
    this.cdr.detectChanges();
  }

  navigateToVmList() {
    this.currentPage = 'vm-list';
    this.cdr.detectChanges();
  }

  dismissPermissionNotification() {
    this.showPermissionNotification = false;
    localStorage.setItem('permission_notification_dismissed', 'true');
    this.cdr.detectChanges();
  }
}
