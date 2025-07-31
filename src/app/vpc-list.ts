import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vpc-list',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="margin-bottom: 1rem;">
        <label>Project ID: <input [(ngModel)]="project" type="text"></label>
        <button (click)="listVPCs()" style="margin-left: 1rem;">List VPCs</button>
        <button (click)="createNewVpc()" style="margin-left: 1rem; background-color: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px;">+ Create VPC</button>
      </div>

      <div *ngIf="error" style="color: red;">{{ error }}</div>

      <div *ngIf="vpcs.length">
        <h3>VPC Networks:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Name</th>
              <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Auto Create Subnets</th>
              <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Routing Mode</th>
              <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Subnetworks</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let vpc of vpcs" style="border-bottom: 1px solid #ddd;">
              <td style="padding: 0.75rem; border: 1px solid #ddd;">
                <a 
                  href="#" 
                  (click)="viewVpcDetails(vpc.name, $event)"
                  style="color: #007bff; text-decoration: none; font-weight: bold;"
                  onmouseover="this.style.textDecoration='underline'"
                  onmouseout="this.style.textDecoration='none'">
                  {{ vpc.name }}
                </a>
              </td>
              <td style="padding: 0.75rem; border: 1px solid #ddd;">
                <span [style.color]="vpc.autoCreateSubnetworks ? 'green' : 'red'">
                  {{ vpc.autoCreateSubnetworks ? 'Yes' : 'No' }}
                </span>
              </td>
              <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ vpc.routingConfig?.routingMode || 'REGIONAL' }}</td>
              <td style="padding: 0.75rem; border: 1px solid #ddd;">
                <span *ngIf="vpc.subnetworks && vpc.subnetworks.length > 0">
                  {{ vpc.subnetworks.length }} subnet(s)
                </span>
                <span *ngIf="!vpc.subnetworks || vpc.subnetworks.length === 0">0 subnets</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!vpcs.length && !error">
        <em>No VPCs found or not yet listed.</em>
      </div>
    </div>
  `,
  styleUrl: './app.css'
})
export class VpcListComponent implements OnInit {
  vpcs: any[] = [];
  error: string | null = null;
  project: string = 'firewalls-order';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
  }

  viewVpcDetails(vpcName: string, event: Event) {
    event.preventDefault();
    // Store VPC name and project in localStorage for the details page
    localStorage.setItem('selected_vpc', vpcName);
    localStorage.setItem('gcp_project', this.project);
    
    // Navigate to details page
    window.location.href = `?page=vpc-details&vpc=${vpcName}&project=${this.project}`;
  }

  createNewVpc() {
    // Store project in localStorage for the wizard
    localStorage.setItem('gcp_project', this.project);
    
    // Navigate to VPC wizard
    window.location.href = `?page=vpc-wizard&project=${this.project}`;
  }

  async listVPCs() {
    const token = localStorage.getItem('gcp_token');
    if (!token) {
      this.error = 'No authentication token found. Please login first.';
      return;
    }

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
      
      gapi.client.setToken({ access_token: token });
      const resp = await gapi.client.compute.networks.list({ project: this.project });
      this.vpcs = resp.result.items || [];
      this.error = null;
      this.cdr.detectChanges();
    } catch (err: any) {
      this.error = 'Failed to fetch VPCs: ' + (err.message || err);
      this.cdr.detectChanges();
    }
  }
} 