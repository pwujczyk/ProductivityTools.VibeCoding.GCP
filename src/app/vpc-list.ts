import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vpc-list',
  imports: [CommonModule, FormsModule],
  template: `
    <div style="font-family: 'Google Sans', 'Roboto', Arial, sans-serif; color: #202124;">
      <!-- Header Section -->
      <div style="background-color: #ffffff; border: 1px solid #dadce0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 500; color: #202124;">VPC Network Management</h3>
          <button (click)="createNewVpc()" 
                  style="background-color: #1a73e8; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-size: 14px; cursor: pointer; display: flex; align-items: center;">
            <span style="margin-right: 8px;">+</span> Create VPC
          </button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: end;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #202124;">Project ID</label>
            <input [(ngModel)]="project" type="text" 
                   style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
          </div>
          <button (click)="listVPCs()" 
                  style="background-color: #1a73e8; color: white; border: none; padding: 12px 24px; border-radius: 4px; font-size: 14px; cursor: pointer;">
            List VPCs
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" 
           style="background-color: #fce8e6; border: 1px solid #f28b82; color: #c5221f; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 14px;">
        {{ error }}
      </div>

      <!-- VPC Networks Table -->
      <div *ngIf="vpcs.length" style="background-color: #ffffff; border: 1px solid #dadce0; border-radius: 8px; overflow: hidden;">
        <!-- Filter Bar -->
        <div style="padding: 16px 20px; border-bottom: 1px solid #dadce0; background-color: #f8f9fa; display: flex; align-items: center; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
            <span style="color: #5f6368; font-size: 16px;">🔍</span>
            <input type="text" placeholder="Enter property name or value" 
                   style="border: 1px solid #dadce0; border-radius: 4px; padding: 8px 12px; font-size: 14px; flex: 1; background-color: #ffffff;">
          </div>
          <button style="background: none; border: 1px solid #dadce0; color: #202124; padding: 8px 12px; border-radius: 4px; font-size: 14px; cursor: pointer;">
            Manage flow logs
          </button>
        </div>

        <!-- Table Header -->
        <div style="padding: 12px 20px; border-bottom: 1px solid #dadce0; background-color: #f8f9fa;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="checkbox" style="width: 16px; height: 16px;">
            <span style="font-size: 14px; font-weight: 500; color: #202124;">VPC Networks ({{ vpcs.length }})</span>
          </div>
        </div>

        <!-- Table -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124; width: 40px;">
                  <input type="checkbox" style="width: 16px; height: 16px;">
                </th>
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124;">
                  Name ↕
                </th>
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124;">
                  Subnets
                </th>
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124;">
                  MTU ⓘ
                </th>
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124;">
                  Mode
                </th>
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124;">
                  IPv6 ULA range
                </th>
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124;">
                  Gateways
                </th>
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124;">
                  Flow log configs ⓘ
                </th>
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124;">
                  Firewall rules
                </th>
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124;">
                  Global dynamic routing ⓘ
                </th>
                <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #dadce0; font-size: 14px; font-weight: 500; color: #202124;">
                  Network profile
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let vpc of vpcs" style="border-bottom: 1px solid #dadce0;">
                <td style="padding: 12px 16px; text-align: center;">
                  <input type="checkbox" style="width: 16px; height: 16px;">
                </td>
                <td style="padding: 12px 16px; font-size: 14px; color: #202124;">
                  <a 
                    href="#" 
                    (click)="viewVpcDetails(vpc.name, $event)"
                    style="color: #1a73e8; text-decoration: none; font-weight: 500;">
                    {{ vpc.name }}
                  </a>
                </td>
                <td style="padding: 12px 16px; font-size: 14px; color: #202124; text-align: center;">
                  {{ vpc.subnetworks ? vpc.subnetworks.length : 0 }}
                </td>
                <td style="padding: 12px 16px; font-size: 14px; color: #202124; text-align: center;">
                  1460
                </td>
                <td style="padding: 12px 16px; font-size: 14px; color: #202124;">
                  {{ vpc.autoCreateSubnetworks ? 'Auto' : 'Custom' }}
                </td>
                <td style="padding: 12px 16px; font-size: 14px; color: #202124;">
                  —
                </td>
                <td style="padding: 12px 16px; font-size: 14px; color: #202124;">
                  —
                </td>
                <td style="padding: 12px 16px; font-size: 14px; color: #202124;">
                  —
                </td>
                <td style="padding: 12px 16px; font-size: 14px; color: #202124; text-align: center;">
                  {{ vpc.firewallRules ? vpc.firewallRules.length : 0 }}
                </td>
                <td style="padding: 12px 16px; font-size: 14px; color: #202124;">
                  Off
                </td>
                <td style="padding: 12px 16px; font-size: 14px; color: #202124;">
                  —
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!vpcs.length && !error" 
           style="background-color: #ffffff; border: 1px solid #dadce0; border-radius: 8px; padding: 48px; text-align: center;">
        <p style="color: #5f6368; font-size: 14px; margin: 0;">No VPCs found or not yet listed.</p>
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

    if (!this.project || this.project.trim() === '') {
      this.error = 'Please enter a valid Project ID.';
      return;
    }

    this.error = null;
    this.vpcs = []; // Clear existing data
    this.cdr.detectChanges();

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
      
      // List all VPC networks in the project (global resources, no zone needed)
      const resp = await gapi.client.compute.networks.list({ 
        project: this.project.trim() 
      });
      
      this.vpcs = resp.result.items || [];
      
      // If no VPCs found, show appropriate message
      if (this.vpcs.length === 0) {
        this.error = null; // Clear any previous errors
      }
      
      this.cdr.detectChanges();
      
    } catch (err: any) {
      console.error('Error fetching VPCs:', err);
      
      // Improved error handling
      if (err.status === 403) {
        this.error = 'Access denied. Please check your permissions for this project.';
      } else if (err.status === 404) {
        this.error = 'Project not found. Please check the Project ID.';
      } else if (err.message) {
        this.error = 'Failed to fetch VPCs: ' + err.message;
      } else {
        this.error = 'Failed to fetch VPCs. Please try again.';
      }
      
      this.cdr.detectChanges();
    }
  }
} 