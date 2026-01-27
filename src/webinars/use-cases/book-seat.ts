import { IMailer } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';

type Request = {
  webinarId: string;
  user: User;
};
type Response = void;

export class BookSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
  ) {}
  async execute({ webinarId, user }: Request): Promise<Response> {

    const webinar = await this.webinarRepository.findById(webinarId);
    const participant_webinar = this.participationRepository.findByWebinarId(webinarId);


    const participants = await this.participationRepository.findByWebinarId(
      webinarId,
    );

    if ((await participant_webinar).length >= webinar.props.seats) {
      throw new Error('Webinar is full');
    }
    const part_restant = webinar.props.seats - (await participant_webinar).length;


    if(participants.find(p => p.props.userId === user.props.id)){
      throw new Error('User already booked a seat for this webinar');
    }

    await this.participationRepository.save({
      userId: user.props.id,
      webinarId: webinar.props.id,
    

    

    return;
  }
}

