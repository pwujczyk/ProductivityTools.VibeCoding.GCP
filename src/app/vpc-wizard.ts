import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vpc-wizard',
  imports: [CommonModule, FormsModule],
  template: `
    <div style="font-family: 'Google Sans', 'Roboto', Arial, sans-serif; color: #202124; background-color: #ffffff; min-height: 100vh;">
      <!-- Header -->
      <div style="background-color: #f8f9fa; border-bottom: 1px solid #dadce0; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <button (click)="goBack()" style="background: none; border: none; color: #1a73e8; font-size: 14px; cursor: pointer; display: flex; align-items: center; margin-right: 16px;">
            <span style="margin-right: 8px;">←</span> Back to VPC List
          </button>
        </div>
        <div style="font-size: 20px; font-weight: 500; color: #202124;">Create VPC Network</div>
        <div></div>
      </div>

      <!-- Main Content -->
      <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
        <!-- Error/Success Messages -->
        <div *ngIf="error" style="background-color: #fce8e6; border: 1px solid #f28b82; color: #c5221f; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 14px;">
          {{ error }}
        </div>
        <div *ngIf="success" style="background-color: #e6f4ea; border: 1px solid #34a853; color: #137333; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 14px;">
          {{ success }}
        </div>

        <div *ngIf="!isCreating">
          <!-- Step Indicator -->
          <div style="margin-bottom: 32px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
              <div 
                *ngFor="let step of steps; let i = index" 
                style="flex: 1; text-align: center; padding: 12px 16px; border-bottom: 3px solid #dadce0; position: relative;"
                [style.border-bottom-color]="currentStep >= i ? '#1a73e8' : '#dadce0'">
                <span [style.color]="currentStep >= i ? '#1a73e8' : '#5f6368'" style="font-size: 14px; font-weight: 500;">
                  {{ i + 1 }}. {{ step }}
                </span>
              </div>
            </div>
          </div>

          <!-- Step 1: Basic Information -->
          <div *ngIf="currentStep === 0" style="background-color: #ffffff; border: 1px solid #dadce0; border-radius: 8px; padding: 24px;">
            <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 500; color: #202124;">Basic Information</h3>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #202124;">
                Project ID
              </label>
              <input [(ngModel)]="vpcConfig.project" type="text" 
                     style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #202124;">
                VPC Name
              </label>
              <input [(ngModel)]="vpcConfig.name" type="text" 
                     style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #202124;">
                Description
              </label>
              <textarea [(ngModel)]="vpcConfig.description" 
                        style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; box-sizing: border-box; height: 80px; resize: vertical;"></textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: flex; align-items: center; font-size: 14px; color: #202124; cursor: pointer;">
                <input [(ngModel)]="vpcConfig.autoCreateSubnetworks" type="checkbox" (change)="onAutoCreateChange()" 
                       style="margin-right: 12px; width: 16px; height: 16px;">
                Auto-create subnetworks
              </label>
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #202124;">
                Routing Mode
              </label>
              <select [(ngModel)]="vpcConfig.routingMode" 
                      style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; box-sizing: border-box; background-color: #ffffff;">
                <option value="REGIONAL">Regional</option>
                <option value="GLOBAL">Global</option>
              </select>
            </div>
          </div>

          <!-- Step 2: Network Configuration -->
          <div *ngIf="currentStep === 1" style="background-color: #ffffff; border: 1px solid #dadce0; border-radius: 8px; padding: 24px;">
            <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 500; color: #202124;">Network Configuration</h3>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #202124;">
                IPv4 Range (optional)
              </label>
              <input [(ngModel)]="vpcConfig.ipv4Range" type="text" placeholder="10.0.0.0/8" 
                     style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; box-sizing: border-box;" 
                     [disabled]="vpcConfig.autoCreateSubnetworks"
                     [style.background-color]="vpcConfig.autoCreateSubnetworks ? '#f8f9fa' : '#ffffff'">
              <small *ngIf="vpcConfig.autoCreateSubnetworks" style="color: #5f6368; font-size: 12px; margin-top: 4px; display: block;">
                IPv4 range is automatically assigned when auto-create subnetworks is enabled.
              </small>
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: flex; align-items: center; font-size: 14px; color: #202124; cursor: pointer;">
                <input [(ngModel)]="vpcConfig.enableUlaInternalIpv6" type="checkbox" 
                       style="margin-right: 12px; width: 16px; height: 16px;">
                Enable ULA internal IPv6 range
              </label>
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: flex; align-items: center; font-size: 14px; color: #202124; cursor: pointer;">
                <input [(ngModel)]="vpcConfig.enableFlowLogs" type="checkbox" 
                       style="margin-right: 12px; width: 16px; height: 16px;">
                Enable VPC flow logs
              </label>
            </div>
          </div>

          <!-- Step 3: Subnetworks -->
          <div *ngIf="currentStep === 2" style="background-color: #ffffff; border: 1px solid #dadce0; border-radius: 8px; padding: 24px;">
            <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 500; color: #202124;">Subnetworks</h3>
            
            <div *ngIf="!vpcConfig.autoCreateSubnetworks">
              <div style="margin-bottom: 16px;">
                <button (click)="addSubnet()" 
                        style="background-color: #1a73e8; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-size: 14px; cursor: pointer; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">+</span> Add Subnetwork
                </button>
              </div>
              
              <div *ngFor="let subnet of vpcConfig.subnetworks; let i = index" 
                   style="border: 1px solid #dadce0; border-radius: 8px; padding: 20px; margin-bottom: 16px; background-color: #f8f9fa;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <h4 style="margin: 0; font-size: 16px; font-weight: 500; color: #202124;">Subnetwork {{ i + 1 }}</h4>
                  <button (click)="removeSubnet(i)" 
                          style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                    Remove
                  </button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #202124;">
                      Name
                    </label>
                    <input [(ngModel)]="subnet.name" type="text" 
                           style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                  </div>
                  
                  <div>
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #202124;">
                      Region
                    </label>
                    <input [(ngModel)]="subnet.region" type="text" placeholder="us-central1" 
                           style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                  </div>
                  
                  <div>
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #202124;">
                      IP Range
                    </label>
                    <input [(ngModel)]="subnet.ipCidrRange" type="text" placeholder="10.0.1.0/24" 
                           style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
                  </div>
                  
                  <div>
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #202124;">
                      Purpose
                    </label>
                    <select [(ngModel)]="subnet.purpose" 
                            style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; font-size: 14px; box-sizing: border-box; background-color: #ffffff;">
                      <option value="PRIVATE_RFC_1918">Private RFC 1918</option>
                      <option value="PRIVATE_SERVICE_CONNECT">Private Service Connect</option>
                      <option value="INTERNAL_HTTPS_LOAD_BALANCER">Internal HTTPS Load Balancer</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div *ngIf="vpcConfig.autoCreateSubnetworks" style="background-color: #e8f0fe; border: 1px solid #dadce0; border-radius: 4px; padding: 16px;">
              <p style="margin: 0; color: #1a73e8; font-size: 14px;">Subnetworks will be automatically created when the VPC is created.</p>
            </div>
          </div>

          <!-- Step 4: Review -->
          <div *ngIf="currentStep === 3" style="background-color: #ffffff; border: 1px solid #dadce0; border-radius: 8px; padding: 24px;">
            <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 500; color: #202124;">Review Configuration</h3>
            
            <div style="border: 1px solid #dadce0; border-radius: 8px; padding: 20px; margin-bottom: 20px; background-color: #f8f9fa;">
              <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 500; color: #202124;">VPC Details</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px;">
                <div><strong>Project:</strong> {{ vpcConfig.project }}</div>
                <div><strong>Name:</strong> {{ vpcConfig.name }}</div>
                <div><strong>Description:</strong> {{ vpcConfig.description || 'None' }}</div>
                <div><strong>Auto-create subnetworks:</strong> {{ vpcConfig.autoCreateSubnetworks ? 'Yes' : 'No' }}</div>
                <div><strong>Routing Mode:</strong> {{ vpcConfig.routingMode }}</div>
                <div><strong>IPv4 Range:</strong> {{ vpcConfig.ipv4Range || 'Auto-assigned' }}</div>
                <div><strong>ULA Internal IPv6:</strong> {{ vpcConfig.enableUlaInternalIpv6 ? 'Enabled' : 'Disabled' }}</div>
                <div><strong>Flow Logs:</strong> {{ vpcConfig.enableFlowLogs ? 'Enabled' : 'Disabled' }}</div>
              </div>
            </div>
            
            <div *ngIf="!vpcConfig.autoCreateSubnetworks && vpcConfig.subnetworks.length > 0" 
                 style="border: 1px solid #dadce0; border-radius: 8px; padding: 20px; margin-bottom: 20px; background-color: #f8f9fa;">
              <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 500; color: #202124;">Subnetworks ({{ vpcConfig.subnetworks.length }})</h4>
              <div *ngFor="let subnet of vpcConfig.subnetworks; let i = index" style="margin-bottom: 8px; font-size: 14px;">
                <strong>Subnet {{ i + 1 }}:</strong> {{ subnet.name }} ({{ subnet.region }}) - {{ subnet.ipCidrRange }}
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div style="margin-top: 32px; display: flex; justify-content: space-between; align-items: center;">
            <button 
              *ngIf="currentStep > 0" 
              (click)="previousStep()" 
              style="padding: 8px 16px; border: 1px solid #dadce0; background-color: #ffffff; color: #202124; border-radius: 4px; font-size: 14px; cursor: pointer;">
              Previous
            </button>
            <div *ngIf="currentStep === 0"></div>
            
            <div style="display: flex; gap: 12px;">
              <button 
                *ngIf="currentStep < steps.length - 1" 
                (click)="nextStep()" 
                style="padding: 8px 16px; border: 1px solid #1a73e8; background-color: #1a73e8; color: white; border-radius: 4px; font-size: 14px; cursor: pointer;">
                Next
              </button>
              <button 
                *ngIf="currentStep === steps.length - 1" 
                (click)="createVpc()" 
                style="padding: 8px 16px; border: 1px solid #34a853; background-color: #34a853; color: white; border-radius: 4px; font-size: 14px; cursor: pointer;">
                Create VPC
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isCreating" style="text-align: center; padding: 48px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 500; color: #202124;">Creating VPC Network...</h3>
          <p style="color: #5f6368; font-size: 14px;">Please wait while your VPC network is being created.</p>
        </div>
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
      case 1: // Network Configuration
        if (!this.vpcConfig.autoCreateSubnetworks && !this.vpcConfig.ipv4Range) {
          this.error = 'IPv4 range is required when auto-create subnetworks is disabled.';
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

  onAutoCreateChange() {
    // Clear IPv4 range when auto-create is enabled
    if (this.vpcConfig.autoCreateSubnetworks) {
      this.vpcConfig.ipv4Range = '';
    }
    this.cdr.detectChanges();
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

      // Only include IPv4 range if auto-create subnetworks is disabled AND we have a value
      if (!this.vpcConfig.autoCreateSubnetworks && this.vpcConfig.ipv4Range && this.vpcConfig.ipv4Range.trim() !== '') {
        vpcBody.IPv4Range = this.vpcConfig.ipv4Range.trim();
      }

      if (this.vpcConfig.enableUlaInternalIpv6) {
        vpcBody.enableUlaInternalIpv6 = true;
      }

      console.log('Creating VPC with configuration:', vpcBody);
      console.log('Auto-create subnetworks:', this.vpcConfig.autoCreateSubnetworks);
      console.log('IPv4 range value:', this.vpcConfig.ipv4Range);

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