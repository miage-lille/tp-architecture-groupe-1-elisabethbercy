import { IMailer } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
import { Participation } from '../entities/participation.entity';

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
    const participant_webinar = await this.participationRepository.findByWebinarId(webinarId,);


    const isParticipating = participant_webinar.find(
      (p) => p.props.userId === user.props.id,
    );

    if (isParticipating) {
      throw new Error('User already booked a seat for this webinar');
    }

    if (participant_webinar.length >= webinar.props.seats) {
      throw new Error('Webinar is full');
    }

    // we create a new Participation entity and save it
    await this.participationRepository.save(
      new Participation({
        userId: user.props.id,
        webinarId: webinar.props.id,
      }),
    );

    // notify the organizer by email
    const organizer = await this.userRepository.findById(
      webinar.props.organizerId,
    );

    // we check if organizer exists
    if (organizer) {
      await this.mailer.send({
        to: organizer.props.email,
        subject: 'New subscription to your webinar',
        body: `A new user has subscribed to your webinar "${webinar.props.title}"`,
      });
    }

    return;
  }
  
}

