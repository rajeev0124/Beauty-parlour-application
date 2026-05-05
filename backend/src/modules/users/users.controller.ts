import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  AssignStaffDto,
  ChangePasswordDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'superadmin')
  findAll(@Query() query: { role?: string; status?: string; search?: string }) {
    return this.usersService.findAll(query);
  }

  @Get('admins')
  @Roles('superadmin')
  findAllAdmins() {
    return this.usersService.findAll({ role: 'admin' });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles('admin', 'superadmin')
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    // Only superadmin can create admin users
    if (createUserDto.role === 'admin' || createUserDto.role === 'superadmin') {
      if (currentUser.role !== 'superadmin') {
        throw new ForbiddenException('Only superadmin can create admin users');
      }
    }
    return this.usersService.create(createUserDto);
  }

  @Post('admin')
  @Roles('superadmin')
  createAdmin(@Body() createUserDto: CreateUserDto) {
    // Force role to admin
    return this.usersService.create({ ...createUserDto, role: 'admin' });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    // Check if trying to update an admin user
    const targetUser = await this.usersService.findById(id);
    if (targetUser.role === 'admin' || targetUser.role === 'superadmin') {
      if (currentUser.role !== 'superadmin') {
        throw new ForbiddenException('Only superadmin can modify admin users');
      }
    }
    // Prevent role elevation unless superadmin
    if (
      updateUserDto.role &&
      (updateUserDto.role === 'admin' || updateUserDto.role === 'superadmin')
    ) {
      if (currentUser.role !== 'superadmin') {
        throw new ForbiddenException('Only superadmin can assign admin roles');
      }
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/block')
  @Roles('admin', 'superadmin')
  async blockUser(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const targetUser = await this.usersService.findById(id);
    if (targetUser.role === 'admin' || targetUser.role === 'superadmin') {
      if (currentUser.role !== 'superadmin') {
        throw new ForbiddenException('Only superadmin can block admin users');
      }
    }
    return this.usersService.update(id, { status: 'blocked' });
  }

  @Put(':id/unblock')
  @Roles('admin', 'superadmin')
  async unblockUser(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const targetUser = await this.usersService.findById(id);
    if (targetUser.role === 'admin' || targetUser.role === 'superadmin') {
      if (currentUser.role !== 'superadmin') {
        throw new ForbiddenException('Only superadmin can unblock admin users');
      }
    }
    return this.usersService.update(id, { status: 'active' });
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  async remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const targetUser = await this.usersService.findById(id);
    // Prevent deleting superadmin
    if (targetUser.role === 'superadmin') {
      throw new ForbiddenException('Cannot delete superadmin account');
    }
    // Only superadmin can delete admin users
    if (targetUser.role === 'admin') {
      if (currentUser.role !== 'superadmin') {
        throw new ForbiddenException('Only superadmin can delete admin users');
      }
    }
    return this.usersService.remove(id);
  }

  @Get(':id/orders')
  getUserOrders(@Param('id') id: string) {
    return this.usersService.getUserOrders(id);
  }

  @Get(':id/appointments')
  getUserAppointments(@Param('id') id: string) {
    return this.usersService.getUserAppointments(id);
  }

  @Put(':id/assign-staff')
  @Roles('admin', 'superadmin')
  assignStaff(@Param('id') id: string, @Body() assignStaffDto: AssignStaffDto) {
    return this.usersService.assignStaff(id, assignStaffDto.staffIds);
  }

  @Put(':id/add-staff/:staffId')
  @Roles('admin', 'superadmin')
  addStaff(@Param('id') id: string, @Param('staffId') staffId: string) {
    return this.usersService.addStaff(id, staffId);
  }

  @Delete(':id/remove-staff/:staffId')
  @Roles('admin', 'superadmin')
  removeStaff(@Param('id') id: string, @Param('staffId') staffId: string) {
    return this.usersService.removeStaff(id, staffId);
  }

  @Delete(':id/clear-staff')
  @Roles('admin', 'superadmin')
  clearAllStaff(@Param('id') id: string) {
    return this.usersService.clearAllStaff(id);
  }

  @Post('change-password')
  changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user._id, changePasswordDto);
  }

  @Put(':id/2fa')
  toggle2FA(@Param('id') id: string, @Body('enabled') enabled: boolean) {
    return this.usersService.toggle2FA(id, enabled);
  }

  @Get(':id/sessions')
  getActiveSessions(@Param('id') id: string) {
    return this.usersService.getActiveSessions(id);
  }

  @Delete(':id/sessions/:sessionId')
  revokeSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.usersService.revokeSession(id, sessionId);
  }
}
