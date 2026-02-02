import { Participation } from 'src/webinars/entities/participation.entity';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';

export class InMemoryParticipationRepository
  implements IParticipationRepository
{
    // this class simulates a database table for Participation entities
  constructor(public database: Participation[] = []) {}

    // async / promesse permet d'émuler une opération asynchrone, même si les données sont en mémoire
  async findByWebinarId(webinarId: string): Promise<Participation[]> {
    return this.database.filter((p) => p.props.webinarId === webinarId);
  }

  async save(participation: Participation): Promise<void> {
    this.database.push(participation);
  }
}