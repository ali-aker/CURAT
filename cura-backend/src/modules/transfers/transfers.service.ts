import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transfer,
  TransferStatus,
  LocationType,
} from './entities/transfer.entity';
import { TransferItem } from './entities/transfer-item.entity';
import { StockMovementsService } from '@modules/stock-movements/stock-movements.service';
import {
  MovementType,
  ReferenceType,
} from '@modules/stock-movements/entities/stock-movement.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ConfirmTransferDto } from './dto/confirm-transfer.dto';
import { CancelTransferDto } from './dto/cancel-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
    @InjectRepository(TransferItem)
    private transferItemRepository: Repository<TransferItem>,
    private stockMovementsService: StockMovementsService,
  ) {}

  private generateTransferNumber(): string {
    return `TRF-${Date.now()}`;
  }

  async create(dto: CreateTransferDto, created_by: string): Promise<Transfer> {
    // التحقق إن الـ from و to مختلفين
    if (dto.from_type === dto.to_type && dto.from_id === dto.to_id) {
      throw new BadRequestException('لا يمكن التحويل من وإلى نفس المكان');
    }

    const transfer = this.transferRepository.create({
      tenant_id: dto.tenant_id,
      transfer_number: this.generateTransferNumber(),
      from_type: dto.from_type,
      from_id: dto.from_id,
      to_type: dto.to_type,
      to_id: dto.to_id,
      status: TransferStatus.PENDING,
      notes: dto.notes,
      created_by,
      items: dto.items.map((item) =>
        this.transferItemRepository.create({
          product_id: item.product_id,
          batch_id: item.batch_id,
          quantity: item.quantity,
        }),
      ),
    });

    return this.transferRepository.save(transfer);
  }

  async findAll(tenant_id: string): Promise<Transfer[]> {
    return this.transferRepository.find({
      where: { tenant_id },
      relations: ['items', 'items.product', 'items.batch'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<Transfer> {
    const transfer = await this.transferRepository.findOne({
      where: { id, tenant_id },
      relations: ['items', 'items.product', 'items.batch'],
    });

    if (!transfer) {
      throw new NotFoundException('التحويل مش موجود');
    }

    return transfer;
  }

  async confirm(
    id: string,
    tenant_id: string,
    dto: ConfirmTransferDto,
    confirmed_by: string,
  ): Promise<Transfer> {
    const transfer = await this.findOne(id, tenant_id);

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('التحويل مش في حالة pending');
    }

    // تسجيل Stock Movements
    for (const item of transfer.items) {
      // OUT من المصدر
      await this.stockMovementsService.create(
        {
          tenant_id: transfer.tenant_id, // ← من الـ transfer
          ...(transfer.from_type === LocationType.BRANCH
            ? { branch_id: transfer.from_id }
            : { warehouse_id: transfer.from_id }),
          product_id: item.product_id,
          batch_id: item.batch_id,
          type: MovementType.OUT,
          quantity: item.quantity,
          reference_type: ReferenceType.TRANSFER_OUT,
          reference_id: transfer.id,
          notes: `تحويل ${transfer.transfer_number}`,
        },
        confirmed_by,
      );

      // IN للوجهة
      await this.stockMovementsService.create(
        {
          tenant_id: transfer.tenant_id, // ← من الـ transfer
          ...(transfer.to_type === LocationType.BRANCH
            ? { branch_id: transfer.to_id }
            : { warehouse_id: transfer.to_id }),
          product_id: item.product_id,
          batch_id: item.batch_id,
          type: MovementType.IN,
          quantity: item.quantity,
          reference_type: ReferenceType.TRANSFER_IN,
          reference_id: transfer.id,
          notes: `استلام تحويل ${transfer.transfer_number}`,
        },
        confirmed_by,
      );
    }

    transfer.status = TransferStatus.CONFIRMED;
    if (dto.notes) transfer.notes = dto.notes;

    return this.transferRepository.save(transfer);
  }

  async cancel(
    id: string,
    tenant_id: string,
    dto: CancelTransferDto,
    cancelled_by: string,
  ): Promise<Transfer> {
    const transfer = await this.findOne(id, tenant_id);

    if (transfer.status === TransferStatus.CANCELLED) {
      throw new BadRequestException('التحويل ملغي بالفعل');
    }

    // لو كان confirmed نعمل reverse للـ Stock Movements
    if (transfer.status === TransferStatus.CONFIRMED) {
      for (const item of transfer.items) {
        // IN للمصدر (عكس الـ OUT)
        await this.stockMovementsService.create(
          {
            tenant_id: transfer.tenant_id, // ← من الـ transfer
            ...(transfer.from_type === LocationType.BRANCH
              ? { branch_id: transfer.from_id }
              : { warehouse_id: transfer.from_id }),
            product_id: item.product_id,
            batch_id: item.batch_id,
            type: MovementType.IN,
            quantity: item.quantity,
            reference_type: ReferenceType.ADJUSTMENT,
            reference_id: transfer.id,
            notes: `إلغاء تحويل ${transfer.transfer_number} - ${dto.cancellation_reason}`,
          },
          cancelled_by,
        );

        // OUT من الوجهة (عكس الـ IN)
        await this.stockMovementsService.create(
          {
            tenant_id: transfer.tenant_id, // ← من الـ transfer
            ...(transfer.to_type === LocationType.BRANCH
              ? { branch_id: transfer.to_id }
              : { warehouse_id: transfer.to_id }),
            product_id: item.product_id,
            batch_id: item.batch_id,
            type: MovementType.OUT,
            quantity: item.quantity,
            reference_type: ReferenceType.ADJUSTMENT,
            reference_id: transfer.id,
            notes: `إلغاء تحويل ${transfer.transfer_number} - ${dto.cancellation_reason}`,
          },
          cancelled_by,
        );
      }
    }

    transfer.status = TransferStatus.CANCELLED;
    transfer.cancellation_reason = dto.cancellation_reason;
    transfer.cancelled_by = cancelled_by;
    transfer.cancelled_at = new Date();

    return this.transferRepository.save(transfer);
  }
}
