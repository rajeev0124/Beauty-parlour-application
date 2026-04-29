import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

interface DefaultUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'superadmin' | 'customer' | 'staff';
  address?: string;
}

@Injectable()
export class AutoSeedService implements OnModuleInit {
  private readonly logger = new Logger(AutoSeedService.name);

  // Default users that will always be available
  private readonly defaultUsers: DefaultUser[] = [
    // Admins
    {
      name: 'Admin Kumar',
      email: 'admin@beauty.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin',
      address: 'Shop No. 5, MG Road, Hyderabad'
    },
    {
      name: 'Super Admin',
      email: 'superadmin@beauty.com',
      phone: '9876543211',
      password: 'super123',
      role: 'superadmin',
      address: 'Admin Office, Banjara Hills, Hyderabad'
    }
  ];

  constructor(
    @InjectModel('User') private userModel: Model<any>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultUsers();
  }

  /**
   * Ensures all default users exist and are active on every startup.
   * This prevents login/signup issues for all user types.
   */
  private async ensureDefaultUsers() {
    this.logger.log('🔐 Checking default users...');

    for (const defaultUser of this.defaultUsers) {
      await this.ensureUserExists(defaultUser);
    }

    this.printLoginCredentials();
  }

  /**
   * Ensures a specific user exists and is active
   */
  private async ensureUserExists(userData: DefaultUser): Promise<void> {
    try {
      const existingUser = await this.userModel.findOne({ email: userData.email });
      
      if (!existingUser) {
        // Create new user
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await this.userModel.create({
          ...userData,
          password: hashedPassword,
          status: 'active'
        });
        this.logger.log(`✅ Created ${userData.role}: ${userData.email}`);
      } else {
        // Ensure user is active and password is correct
        const updates: any = {};
        
        if (existingUser.status === 'blocked') {
          updates.status = 'active';
        }
        
        // Always reset password for default users to prevent lockouts
        updates.password = await bcrypt.hash(userData.password, 12);
        
        if (Object.keys(updates).length > 0) {
          await this.userModel.updateOne({ email: userData.email }, updates);
          if (existingUser.status === 'blocked') {
            this.logger.log(`✅ Reactivated ${userData.role}: ${userData.email}`);
          }
        }
        this.logger.log(`✅ ${userData.role} exists: ${userData.email}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to ensure user ${userData.email}: ${error.message}`);
    }
  }

  /**
   * Print login credentials to console
   */
  private printLoginCredentials(): void {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 DEFAULT LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('👨‍💼 ADMIN LOGINS:');
    console.log('   📧 admin@beauty.com / admin123');
    console.log('   📧 superadmin@beauty.com / super123');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Reset any user's password to default (for password recovery)
   */
  async resetUserPassword(email: string): Promise<{ success: boolean; newPassword?: string }> {
    const defaultUser = this.defaultUsers.find(u => u.email === email);
    
    if (defaultUser) {
      // Reset to default password
      const hashedPassword = await bcrypt.hash(defaultUser.password, 12);
      await this.userModel.updateOne(
        { email },
        { password: hashedPassword, status: 'active' }
      );
      return { success: true, newPassword: defaultUser.password };
    }
    
    // For non-default users, generate a temporary password
    const tempPassword = 'temp' + Math.random().toString(36).slice(-6);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    
    const result = await this.userModel.updateOne(
      { email },
      { password: hashedPassword, status: 'active' }
    );
    
    if (result.modifiedCount > 0) {
      return { success: true, newPassword: tempPassword };
    }
    
    return { success: false };
  }

  /**
   * Unblock any blocked user
   */
  async unblockUser(email: string): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { email },
      { status: 'active' }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Check if a user exists
   */
  async userExists(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    return !!user;
  }
}
