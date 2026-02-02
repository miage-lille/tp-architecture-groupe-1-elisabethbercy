import { InMemoryMailer } from 'src/core/adapters/in-memory-mailer';
import { User } from 'src/users/entities/user.entity';
import { InMemoryUserRepository } from 'src/webinars/adapters/user-repository.in-memory';
import { InMemoryParticipationRepository } from 'src/webinars/adapters/participation-repository.in-memory';
import { InMemoryWebinarRepository } from 'src/webinars/adapters/webinar-repository.in-memory';
import { Participation } from 'src/webinars/entities/participation.entity';
import { Webinar } from 'src/webinars/entities/webinar.entity';
import { BookSeat } from 'src/webinars/use-cases/book-seat';

describe('Feature: Book a seat', () => {
  // rappel , let permet de déclarer une variable qui sera accessible dans tout le scope du describe
  //
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let webinarRepository: InMemoryWebinarRepository;
  let mailer: InMemoryMailer;
  let useCase: BookSeat;

  // utilisateurs de test
  const user = new User({
    id: 'user-bob',
    email: 'bob@example.com',
    password: 'password',
  });

  const organizer = new User({
    id: 'user-alice',
    email: 'alice@example.com',
    password: 'password',
  });
  // fin des utilisateurs de test

  // webinar de test
  const webinar = new Webinar({
    id: 'webinar-1',
    organizerId: 'user-alice',
    title: 'Architecture 101',
    startDate: new Date('2024-01-20T10:00:00.000Z'),
    endDate: new Date('2024-01-20T11:00:00.000Z'),
    seats: 2,
  });
  // fin du webinar de test

  // base setup for each test
  beforeEach(() => {
    participationRepository = new InMemoryParticipationRepository();
    userRepository = new InMemoryUserRepository([user, organizer]);
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    mailer = new InMemoryMailer();
    useCase = new BookSeat(
      participationRepository,
      userRepository,
      webinarRepository,
      mailer,
    );
  });

  // describe allows to group tests
  describe('Scenario: Happy path', () => {
    it('should book a seat', async () => {
      await useCase.execute({ webinarId: 'webinar-1', user });

      const participations = await participationRepository.findByWebinarId(
        'webinar-1',
      );
      expect(participations).toHaveLength(1);
      expect(participations[0].props).toEqual({
        userId: 'user-bob',
        webinarId: 'webinar-1',
      });
    });

    it('should send an email to the organizer', async () => {
      await useCase.execute({ webinarId: 'webinar-1', user });

      expect(mailer.sentEmails).toHaveLength(1);
      expect(mailer.sentEmails[0]).toEqual({
        to: 'alice@example.com',
        subject: 'New subscription to your webinar',
        body: 'A new user has subscribed to your webinar "Architecture 101"',
      });
    });
  });

  describe('Scenario: Webinar is full', () => {
    const fullWebinar = new Webinar({
        id: 'webinar-full',
        organizerId: 'user-alice',
        title: 'Full Webinar',
        startDate: new Date('2024-01-20T10:00:00.000Z'),
        endDate: new Date('2024-01-20T11:00:00.000Z'),
        seats: 1, 
      });

    beforeEach(async () => {
        // Le webinar n'a qu'une seule place, et elle est déjà prise par quelqu'un d'autre
        await webinarRepository.create(fullWebinar);
        await participationRepository.save(new Participation({ userId: 'other-user', webinarId: 'webinar-full' }));
    });

    it('should throw an error', async () => {
      await expect(
        useCase.execute({ webinarId: 'webinar-full', user }),
      ).rejects.toThrow('Webinar is full');
    });

    it('should not send an email', async () => {
        try {
            await useCase.execute({ webinarId: 'webinar-full', user });
        } catch (e) {}
        expect(mailer.sentEmails).toHaveLength(0);
    });
  });

  describe('Scenario: User already booked', () => {
    beforeEach(async () => {
      await participationRepository.save(
        new Participation({ userId: 'user-bob', webinarId: 'webinar-1' }),
      );
    });

    it('should throw an error', async () => {
      await expect(
        useCase.execute({ webinarId: 'webinar-1', user }),
      ).rejects.toThrow('User already booked a seat for this webinar');
    });
  });
});