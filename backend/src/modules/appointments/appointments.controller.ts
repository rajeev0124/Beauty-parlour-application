import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, UpdateStatusDto } from './dto/appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin', 'staff')
  findAll(@Query() query: { status?: string; date?: string }) {
    return this.appointmentsService.findAll(query);
  }

  // IMPORTANT: Specific routes MUST come before generic :id routes
  @Get('user/:id')
  findByUser(@Param('id') userId: string) {
    return this.appointmentsService.findByUser(userId);
  }

  @Get('staff/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin', 'staff')
  findByStaff(@Param('id') staffId: string) {
    return this.appointmentsService.findByStaff(staffId);
  }

  // Generic :id route MUST be after specific routes
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.appointmentsService.findById(id);
  }

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @CurrentUser() user: any) {
    // Use the authenticated user's ID from JWT to ensure consistency
    const appointmentData = {
      ...createAppointmentDto,
      userId: user._id.toString(), // Always use JWT user ID for security
      userName: createAppointmentDto.userName || user.name,
    };
    return this.appointmentsService.create(appointmentData);
  }

  // IMPORTANT: Specific PUT routes MUST come before generic :id routes
  @Put('status/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin', 'staff')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.appointmentsService.updateStatus(id, updateStatusDto);
  }

  // Generic :id route MUST be after specific routes
  @Put(':id')
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
