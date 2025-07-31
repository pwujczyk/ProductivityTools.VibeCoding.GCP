import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
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
              <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ vpc.name }}</td>
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
  }

  async listVPCs() {
    const token = localStorage.getItem('gcp_token');
    if (!token) {
      this.error = 'No authentication token found. Please login first.';
      return;
    }

    try {
      const gapi = (window as any).gapi;
      gapi.client.setToken({ access_token: token });
      const resp = await gapi.client.compute.networks.list({ project: this.project });
      this.vpcs = resp.result.items || [];
      this.error = null;
    } catch (err: any) {
      this.error = 'Failed to fetch VPCs: ' + (err.message || err);
    }
  }
} 