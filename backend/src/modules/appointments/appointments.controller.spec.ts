import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  const mockAppointmentsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: mockAppointmentsService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const query = { status: 'pending' };
      await controller.findAll(query);
      expect(mockAppointmentsService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('create', () => {
    it('should call service.create with user from request', async () => {
      const dto = { serviceId: '123', date: '2024-01-01', time: '10:00' };
      const user = { _id: { toString: () => 'user123' } };
      await controller.create(dto as any, user);

      expect(mockAppointmentsService.create).toHaveBeenCalledWith({
        ...dto,
        userId: 'user123',
      });
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateStatus', async () => {
      const id = 'app123';
      const dto = { status: 'confirmed' };

      await controller.updateStatus(id, dto as any);

      expect(mockAppointmentsService.updateStatus).toHaveBeenCalledWith(
        id,
        dto,
      );
    });
  });
});
