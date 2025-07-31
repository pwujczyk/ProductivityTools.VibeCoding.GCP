import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vpc-wizard',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="margin-bottom: 1rem;">
        <button (click)="goBack()" style="margin-right: 1rem;">← Back to VPC List</button>
      </div>

      <div *ngIf="error" style="color: red;">{{ error }}</div>
      <div *ngIf="success" style="color: green;">{{ success }}</div>

      <div *ngIf="!isCreating">
        <h2>Create New VPC Network</h2>
        
        <!-- Step Indicator -->
        <div style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
            <div 
              *ngFor="let step of steps; let i = index" 
              style="flex: 1; text-align: center; padding: 0.5rem; border-bottom: 3px solid #ddd;"
              [style.border-bottom-color]="currentStep >= i ? '#007bff' : '#ddd'">
              <span [style.color]="currentStep >= i ? '#007bff' : '#666'">
                {{ i + 1 }}. {{ step }}
              </span>
            </div>
          </div>
        </div>

        <!-- Step 1: Basic Information -->
        <div *ngIf="currentStep === 0">
          <h3>Basic Information</h3>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">
              Project ID: <input [(ngModel)]="vpcConfig.project" type="text" style="width: 100%; padding: 0.5rem;">
            </label>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">
              VPC Name: <input [(ngModel)]="vpcConfig.name" type="text" style="width: 100%; padding: 0.5rem;">
            </label>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">
              Description: <textarea [(ngModel)]="vpcConfig.description" style="width: 100%; padding: 0.5rem; height: 60px;"></textarea>
            </label>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">
              <input [(ngModel)]="vpcConfig.autoCreateSubnetworks" type="checkbox">
              Auto-create subnetworks
            </label>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">
              Routing Mode:
              <select [(ngModel)]="vpcConfig.routingMode" style="width: 100%; padding: 0.5rem;">
                <option value="REGIONAL">Regional</option>
                <option value="GLOBAL">Global</option>
              </select>
            </label>
          </div>
        </div>

        <!-- Step 2: Network Configuration -->
        <div *ngIf="currentStep === 1">
          <h3>Network Configuration</h3>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">
              IPv4 Range (optional): <input [(ngModel)]="vpcConfig.ipv4Range" type="text" placeholder="10.0.0.0/8" style="width: 100%; padding: 0.5rem;">
            </label>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">
              <input [(ngModel)]="vpcConfig.enableUlaInternalIpv6" type="checkbox">
              Enable ULA internal IPv6 range
            </label>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem;">
              <input [(ngModel)]="vpcConfig.enableFlowLogs" type="checkbox">
              Enable VPC flow logs
            </label>
          </div>
        </div>

        <!-- Step 3: Subnetworks -->
        <div *ngIf="currentStep === 2">
          <h3>Subnetworks</h3>
          <div *ngIf="!vpcConfig.autoCreateSubnetworks">
            <div style="margin-bottom: 1rem;">
              <button (click)="addSubnet()" style="margin-bottom: 1rem;">+ Add Subnetwork</button>
            </div>
            <div *ngFor="let subnet of vpcConfig.subnetworks; let i = index" style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem;">
              <h4>Subnetwork {{ i + 1 }}</h4>
              <div style="margin-bottom: 0.5rem;">
                <label style="display: block; margin-bottom: 0.25rem;">
                  Name: <input [(ngModel)]="subnet.name" type="text" style="width: 100%; padding: 0.5rem;">
                </label>
              </div>
              <div style="margin-bottom: 0.5rem;">
                <label style="display: block; margin-bottom: 0.25rem;">
                  Region: <input [(ngModel)]="subnet.region" type="text" placeholder="us-central1" style="width: 100%; padding: 0.5rem;">
                </label>
              </div>
              <div style="margin-bottom: 0.5rem;">
                <label style="display: block; margin-bottom: 0.25rem;">
                  IP Range: <input [(ngModel)]="subnet.ipCidrRange" type="text" placeholder="10.0.1.0/24" style="width: 100%; padding: 0.5rem;">
                </label>
              </div>
              <div style="margin-bottom: 0.5rem;">
                <label style="display: block; margin-bottom: 0.25rem;">
                  Purpose:
                  <select [(ngModel)]="subnet.purpose" style="width: 100%; padding: 0.5rem;">
                    <option value="PRIVATE_RFC_1918">Private RFC 1918</option>
                    <option value="PRIVATE_SERVICE_CONNECT">Private Service Connect</option>
                    <option value="INTERNAL_HTTPS_LOAD_BALANCER">Internal HTTPS Load Balancer</option>
                  </select>
                </label>
              </div>
              <button (click)="removeSubnet(i)" style="background-color: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px;">Remove</button>
            </div>
          </div>
          <div *ngIf="vpcConfig.autoCreateSubnetworks">
            <p>Subnetworks will be automatically created when the VPC is created.</p>
          </div>
        </div>

        <!-- Step 4: Review -->
        <div *ngIf="currentStep === 3">
          <h3>Review Configuration</h3>
          <div style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem;">
            <h4>VPC Details</h4>
            <p><strong>Project:</strong> {{ vpcConfig.project }}</p>
            <p><strong>Name:</strong> {{ vpcConfig.name }}</p>
            <p><strong>Description:</strong> {{ vpcConfig.description || 'None' }}</p>
            <p><strong>Auto-create subnetworks:</strong> {{ vpcConfig.autoCreateSubnetworks ? 'Yes' : 'No' }}</p>
            <p><strong>Routing Mode:</strong> {{ vpcConfig.routingMode }}</p>
            <p><strong>IPv4 Range:</strong> {{ vpcConfig.ipv4Range || 'Auto-assigned' }}</p>
            <p><strong>ULA Internal IPv6:</strong> {{ vpcConfig.enableUlaInternalIpv6 ? 'Enabled' : 'Disabled' }}</p>
            <p><strong>Flow Logs:</strong> {{ vpcConfig.enableFlowLogs ? 'Enabled' : 'Disabled' }}</p>
          </div>
          
          <div *ngIf="!vpcConfig.autoCreateSubnetworks && vpcConfig.subnetworks.length > 0" style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem;">
            <h4>Subnetworks ({{ vpcConfig.subnetworks.length }})</h4>
            <div *ngFor="let subnet of vpcConfig.subnetworks; let i = index">
              <p><strong>Subnet {{ i + 1 }}:</strong> {{ subnet.name }} ({{ subnet.region }}) - {{ subnet.ipCidrRange }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div style="margin-top: 2rem;">
          <button 
            *ngIf="currentStep > 0" 
            (click)="previousStep()" 
            style="margin-right: 1rem; padding: 0.5rem 1rem; border: 1px solid #ddd; background-color: #f8f9fa;">
            Previous
          </button>
          <button 
            *ngIf="currentStep < steps.length - 1" 
            (click)="nextStep()" 
            style="padding: 0.5rem 1rem; border: 1px solid #007bff; background-color: #007bff; color: white;">
            Next
          </button>
          <button 
            *ngIf="currentStep === steps.length - 1" 
            (click)="createVpc()" 
            style="padding: 0.5rem 1rem; border: 1px solid #28a745; background-color: #28a745; color: white;">
            Create VPC
          </button>
        </div>
      </div>

      <div *ngIf="isCreating">
        <h3>Creating VPC Network...</h3>
        <p>Please wait while your VPC network is being created.</p>
      </div>
    </div>
  `,
  styleUrl: './app.css'
})
export class VpcWizardComponent implements OnInit {
  currentStep = 0;
  steps = ['Basic Information', 'Network Configuration', 'Subnetworks', 'Review'];
  isCreating = false;
  error: string | null = null;
  success: string | null = null;

  vpcConfig = {
    project: 'firewalls-order',
    name: '',
    description: '',
    autoCreateSubnetworks: true,
    routingMode: 'REGIONAL',
    ipv4Range: '',
    enableUlaInternalIpv6: false,
    enableFlowLogs: false,
    subnetworks: [] as any[]
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
  }

  goBack() {
    window.history.back();
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      // Validate current step before proceeding
      if (this.validateCurrentStep()) {
        this.currentStep++;
        this.cdr.detectChanges();
      }
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.cdr.detectChanges();
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 0: // Basic Information
        if (!this.vpcConfig.name) {
          this.error = 'VPC name is required.';
          return false;
        }
        if (!this.vpcConfig.project) {
          this.error = 'Project ID is required.';
          return false;
        }
        break;
      case 2: // Subnetworks
        if (!this.vpcConfig.autoCreateSubnetworks && this.vpcConfig.subnetworks.length === 0) {
          this.error = 'At least one subnetwork is required when auto-create is disabled.';
          return false;
        }
        // Validate each subnet
        for (let i = 0; i < this.vpcConfig.subnetworks.length; i++) {
          const subnet = this.vpcConfig.subnetworks[i];
          if (!subnet.name || !subnet.region || !subnet.ipCidrRange) {
            this.error = `Subnetwork ${i + 1} is missing required fields (name, region, or IP range).`;
            return false;
          }
        }
        break;
    }
    this.error = null;
    return true;
  }

  addSubnet() {
    this.vpcConfig.subnetworks.push({
      name: '',
      region: '',
      ipCidrRange: '',
      purpose: 'PRIVATE_RFC_1918'
    });
  }

  removeSubnet(index: number) {
    this.vpcConfig.subnetworks.splice(index, 1);
  }

  async createVpc() {
    const token = localStorage.getItem('gcp_token');
    if (!token) {
      this.error = 'No authentication token found. Please login first.';
      return;
    }

    if (!this.vpcConfig.name) {
      this.error = 'VPC name is required.';
      return;
    }

    // Validate VPC name format
    const vpcNameRegex = /^[a-z]([a-z0-9-]*[a-z0-9])?$/;
    if (!vpcNameRegex.test(this.vpcConfig.name)) {
      this.error = 'VPC name must be 1-63 characters long, contain only lowercase letters, numbers, and hyphens, and start with a letter.';
      return;
    }

    if (this.vpcConfig.name.length > 63) {
      this.error = 'VPC name must be 1-63 characters long.';
      return;
    }

    this.isCreating = true;
    this.error = null;
    this.success = null;

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

      // Prepare VPC configuration
      const vpcBody: any = {
        name: this.vpcConfig.name,
        autoCreateSubnetworks: this.vpcConfig.autoCreateSubnetworks,
        routingConfig: {
          routingMode: this.vpcConfig.routingMode
        }
      };

      if (this.vpcConfig.description) {
        vpcBody.description = this.vpcConfig.description;
      }

      if (this.vpcConfig.ipv4Range) {
        vpcBody.IPv4Range = this.vpcConfig.ipv4Range;
      }

      if (this.vpcConfig.enableUlaInternalIpv6) {
        vpcBody.enableUlaInternalIpv6 = true;
      }

      console.log('Creating VPC with configuration:', vpcBody);

      // Create VPC
      const vpcResp = await gapi.client.compute.networks.insert({
        project: this.vpcConfig.project,
        resource: vpcBody
      });

      console.log('VPC created successfully:', vpcResp);

      // Create subnetworks if specified
      if (!this.vpcConfig.autoCreateSubnetworks && this.vpcConfig.subnetworks.length > 0) {
        for (const subnet of this.vpcConfig.subnetworks) {
          if (subnet.name && subnet.region && subnet.ipCidrRange) {
            console.log('Creating subnet:', subnet);
            await gapi.client.compute.subnetworks.insert({
              project: this.vpcConfig.project,
              region: subnet.region,
              resource: {
                name: subnet.name,
                ipCidrRange: subnet.ipCidrRange,
                network: `projects/${this.vpcConfig.project}/global/networks/${this.vpcConfig.name}`,
                purpose: subnet.purpose
              }
            });
          }
        }
      }

      this.success = `VPC "${this.vpcConfig.name}" created successfully!`;
      this.isCreating = false;
      this.cdr.detectChanges();

      // Redirect to VPC list after 2 seconds
      setTimeout(() => {
        window.location.href = '?page=vpc-list';
      }, 2000);

    } catch (err: any) {
      console.error('Error creating VPC:', err);
      
      // Check for insufficient permissions
      if (err.status === 403 && err.body) {
        try {
          const errorBody = JSON.parse(err.body);
          if (errorBody.error && errorBody.error.message && 
              errorBody.error.message.includes('insufficient authentication scopes')) {
            this.error = 'Insufficient permissions. You need to re-authenticate with write permissions. Please logout and login again.';
            this.isCreating = false;
            this.cdr.detectChanges();
            return;
          }
        } catch (parseErr) {
          // Continue with normal error handling
        }
      }
      
      // Improved error handling
      let errorMessage = 'Failed to create VPC: ';
      
      if (err.error) {
        // GCP API error
        if (err.error.errors && err.error.errors.length > 0) {
          errorMessage += err.error.errors[0].message || 'Unknown API error';
        } else if (err.error.message) {
          errorMessage += err.error.message;
        } else {
          errorMessage += JSON.stringify(err.error);
        }
      } else if (err.message) {
        // Standard error message
        errorMessage += err.message;
      } else if (typeof err === 'string') {
        // String error
        errorMessage += err;
      } else {
        // Fallback
        errorMessage += JSON.stringify(err);
      }
      
      this.error = errorMessage;
      this.isCreating = false;
      this.cdr.detectChanges();
    }
  }
} 