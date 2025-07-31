import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vpc-details',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="margin-bottom: 1rem;">
        <button (click)="goBack()" style="margin-right: 1rem;">← Back to VPC List</button>
        <button (click)="refreshDetails()" style="margin-left: 1rem;">Refresh</button>
      </div>

      <div *ngIf="error" style="color: red;">{{ error }}</div>

      <div *ngIf="vpcDetails">
        <h2>VPC Network: {{ vpcDetails.name }}</h2>
        
        <!-- Basic Information -->
        <div style="margin-bottom: 2rem;">
          <h3>Basic Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
            <tbody>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 0.75rem; border: 1px solid #ddd; font-weight: bold; width: 200px;">Name</td>
                <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ vpcDetails.name }}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 0.75rem; border: 1px solid #ddd; font-weight: bold;">Auto Create Subnets</td>
                <td style="padding: 0.75rem; border: 1px solid #ddd;">
                  <span [style.color]="vpcDetails.autoCreateSubnetworks ? 'green' : 'red'">
                    {{ vpcDetails.autoCreateSubnetworks ? 'Yes' : 'No' }}
                  </span>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 0.75rem; border: 1px solid #ddd; font-weight: bold;">Routing Mode</td>
                <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ vpcDetails.routingConfig?.routingMode || 'REGIONAL' }}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 0.75rem; border: 1px solid #ddd; font-weight: bold;">Network Range</td>
                <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ vpcDetails.IPv4Range || 'N/A' }}</td>
              </tr>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 0.75rem; border: 1px solid #ddd; font-weight: bold;">Creation Time</td>
                <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ formatDate(vpcDetails.creationTimestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Subnets -->
        <div style="margin-bottom: 2rem;">
          <h3>Subnetworks ({{ subnets.length }})</h3>
          <div *ngIf="subnets.length > 0">
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Name</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Region</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">IP Range</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Gateway</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let subnet of subnets" style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ subnet.name }}</td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ subnet.region?.split('/').pop() || 'N/A' }}</td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ subnet.ipCidrRange }}</td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ subnet.gatewayAddress || 'N/A' }}</td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ subnet.purpose || 'PRIVATE' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="subnets.length === 0">
            <em>No subnetworks found for this VPC.</em>
          </div>
        </div>

        <!-- Firewall Rules -->
        <div style="margin-bottom: 2rem;">
          <h3>Firewall Rules ({{ firewallRules.length }})</h3>
          <div *ngIf="firewallRules.length > 0">
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Name</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Direction</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Priority</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Source Ranges</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Target Tags</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Allowed Ports</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let rule of firewallRules" style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ rule.name }}</td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ rule.direction }}</td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ rule.priority }}</td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">
                    <span *ngIf="rule.sourceRanges && rule.sourceRanges.length > 0">
                      {{ rule.sourceRanges.join(', ') }}
                    </span>
                    <span *ngIf="!rule.sourceRanges || rule.sourceRanges.length === 0">All</span>
                  </td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">
                    <span *ngIf="rule.targetTags && rule.targetTags.length > 0">
                      {{ rule.targetTags.join(', ') }}
                    </span>
                    <span *ngIf="!rule.targetTags || rule.targetTags.length === 0">All</span>
                  </td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">
                    <span *ngIf="rule.allowed && rule.allowed.length > 0">
                      <span *ngFor="let allowed of rule.allowed; let last = last">
                        {{ allowed.IPProtocol }}{{ allowed.ports ? ':' + allowed.ports.join(',') : '' }}{{ !last ? '; ' : '' }}
                      </span>
                    </span>
                    <span *ngIf="!rule.allowed || rule.allowed.length === 0">All</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="firewallRules.length === 0">
            <em>No firewall rules found for this VPC.</em>
          </div>
        </div>

        <!-- Connected Instances -->
        <div style="margin-bottom: 2rem;">
          <h3>Connected Instances ({{ connectedInstances.length }})</h3>
          <div *ngIf="connectedInstances.length > 0">
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Name</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Zone</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Status</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">Internal IP</th>
                  <th style="padding: 0.75rem; text-align: left; border: 1px solid #ddd;">External IP</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let instance of connectedInstances" style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ instance.name }}</td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">{{ instance.zone?.split('/').pop() || 'N/A' }}</td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">
                    <span [style.color]="instance.status === 'RUNNING' ? 'green' : instance.status === 'STOPPED' ? 'red' : 'orange'">
                      {{ instance.status }}
                    </span>
                  </td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">
                    {{ instance.networkInterfaces?.[0]?.networkIP || 'N/A' }}
                  </td>
                  <td style="padding: 0.75rem; border: 1px solid #ddd;">
                    {{ instance.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP || 'N/A' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="connectedInstances.length === 0">
            <em>No instances found connected to this VPC.</em>
          </div>
        </div>
      </div>

      <div *ngIf="!vpcDetails && !error">
        <em>Loading VPC details...</em>
      </div>
    </div>
  `,
  styleUrl: './app.css'
})
export class VpcDetailsComponent implements OnInit {
  vpcDetails: any = null;
  subnets: any[] = [];
  firewallRules: any[] = [];
  connectedInstances: any[] = [];
  error: string | null = null;
  project: string = 'firewalls-order';
  vpcName: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Get VPC name from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    this.vpcName = urlParams.get('vpc') || localStorage.getItem('selected_vpc') || '';
    this.project = urlParams.get('project') || localStorage.getItem('gcp_project') || 'firewalls-order';
    
    if (this.vpcName) {
      this.loadVpcDetails();
    } else {
      this.error = 'No VPC name provided';
    }
  }

  goBack() {
    window.history.back();
  }

  refreshDetails() {
    this.loadVpcDetails();
  }

  async loadVpcDetails() {
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

      // Load VPC details
      const vpcResp = await gapi.client.compute.networks.get({ 
        project: this.project, 
        network: this.vpcName 
      });
      this.vpcDetails = vpcResp.result;

      // Load subnets
      await this.loadSubnets();

      // Load firewall rules
      await this.loadFirewallRules();

      // Load connected instances
      await this.loadConnectedInstances();

      this.error = null;
      this.cdr.detectChanges();
    } catch (err: any) {
      this.error = 'Failed to fetch VPC details: ' + (err.message || err);
      this.cdr.detectChanges();
    }
  }

  async loadSubnets() {
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
      
      const resp = await gapi.client.compute.subnetworks.list({ 
        project: this.project 
      });
      
      // Filter subnets that belong to this VPC
      this.subnets = (resp.result.items || []).filter((subnet: any) => 
        subnet.network && subnet.network.includes(this.vpcName)
      );
    } catch (err: any) {
      console.error('Failed to load subnets:', err);
    }
  }

  async loadFirewallRules() {
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
      
      const resp = await gapi.client.compute.firewalls.list({ 
        project: this.project 
      });
      
      // Filter firewall rules that apply to this VPC
      this.firewallRules = (resp.result.items || []).filter((rule: any) => 
        rule.network && rule.network.includes(this.vpcName)
      );
    } catch (err: any) {
      console.error('Failed to load firewall rules:', err);
    }
  }

  async loadConnectedInstances() {
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
      
      const resp = await gapi.client.compute.instances.aggregatedList({ 
        project: this.project 
      });
      
      // Filter instances that are connected to this VPC
      this.connectedInstances = [];
      if (resp.result.items) {
        for (const zone in resp.result.items) {
          const instances = resp.result.items[zone].instances || [];
          for (const instance of instances) {
            if (instance.networkInterfaces && instance.networkInterfaces.length > 0) {
              const networkName = instance.networkInterfaces[0].network?.split('/').pop();
              if (networkName === this.vpcName) {
                this.connectedInstances.push(instance);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load connected instances:', err);
    }
  }

  formatDate(timestamp: string): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  }
} 