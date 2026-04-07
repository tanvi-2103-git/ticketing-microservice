import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@sgtickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
    const { id, title, price, version } = data;

    // `findByEvent` (version === n-1) fails when NATS delivers `ticket:updated` before
    // `ticket:created`, or on replay — order and ticket DB can disagree. Apply event as source of truth.
    const _id = new (mongoose.Types.ObjectId as any)(id);

    await Ticket.collection.updateOne(
      { _id },
      { $set: { title, price, version } },
      { upsert: true }
    );

    msg.ack();
  }
}
