import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contacts } from '../contacts/models/contacts.model';
import { Tags } from '../tags/tags.model';
import { Sequelize } from 'sequelize-typescript';
import { DailySale } from './interfaces/daily-sale.interface';

@Injectable()
export class InvestorsInfoService {
  constructor(
    @InjectModel(Contacts)
    private readonly contactsRepository: typeof Contacts,
  ) {}

  async getDailySales(tagId: number, statusId?: number): Promise<{ dailySales: DailySale[] }> {
    const whereClause: any = {
      '$tags.tag_id$': tagId,
    };

    if (statusId) {
      whereClause.status_id = statusId;
    }

    const contacts = await this.contactsRepository.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('Contacts.createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('Contacts.contact_id')), 'quantity'],
      ],
      include: [
        {
          model: Tags,
          attributes: [],
          through: { attributes: [] },
          where: { tag_id: tagId },
        },
      ],
      where: whereClause,
      group: [Sequelize.fn('DATE', Sequelize.col('Contacts.createdAt'))],
      raw: true,
    });

    return {
        dailySales: contacts.map((contact: any) => ({
            date: contact.date,
            quantity: parseInt(contact.quantity),
            total: parseInt(contact.quantity) * 1000,
        }))
    }
  }
} 