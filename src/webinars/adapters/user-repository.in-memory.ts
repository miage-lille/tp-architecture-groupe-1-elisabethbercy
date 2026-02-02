import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';

export class InMemoryUserRepository implements IUserRepository {
  constructor(public database: User[] = []) {}
    // this class simulates a database table for User entities
    // in-memory veut dire que les données sont stockées
    //  dans une structure de données en mémoire (comme un tableau) 
    // plutôt que dans une base de données persistante
    
  async findById(id: string): Promise<User | null> {
    return this.database.find((user) => user.props.id === id) || null;
  }
}