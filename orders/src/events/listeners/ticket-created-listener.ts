import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@sgtickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message): Promise<void> {
    const { id, title, price } = data;

    // `id` is the tickets service’s existing _id (string in the event). We only cast to
    // ObjectId so the driver matches BSON on disk — we are not minting a new id here.
    const _id = new (mongoose.Types.ObjectId as any)(id);

    await Ticket.collection.updateOne(
      { _id },
      {
        $set: { title, price },
        $setOnInsert: { version: 0 },
      },
      { upsert: true }
    );

    msg.ack();
  }
}
