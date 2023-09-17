import { faker } from '@faker-js/faker';
import { ERequestStatus, ERequestType, EUserStatus, Prisma } from '@prisma/client';
import fs from 'fs';

const generators = {
  Account: {
    _qty: 0,
    type: () => faker.lorem.word(),
    provider: () => faker.lorem.word(),
    userId: 'User',
  },

  Session: {
    _qty: 0,
    sessionToken: () => faker.string.uuid(),
    expires: () => faker.date.past(),
    userId: 'User',
  },

  User: {
    _qty: 70,
    firstName: () => faker.person.firstName(),
    lastName: () => faker.person.lastName(),
    email: () => faker.internet.email(),
    password: () => faker.internet.password(),
    phone_number: () => faker.phone.number('+375 29 ### ## ##'),
    address: () => `${faker.location.city()}, ${faker.location.country()}`,
    avatar_id: 'Avatar',
    global_role_id: 'Role',
    status: () => {
      const rand = Math.random() * 100;
      if (rand < 35) return EUserStatus.Active;
      if (rand < 70) return EUserStatus.Suspended;
      return EUserStatus.Inactive;
    },
  },

  Project: {
    _qty: 100,
    ownerId: 'User',
    title: () => faker.commerce.productName(),
    role: 'Role',
    description: () => (Math.random() < 0.5 ? faker.commerce.productDescription() : undefined),
  },

  MembersOnProjects: {
    _qty: 500,
    userId: 'User',
    projectId: 'Project',
    role_id: () => (Math.random() < 0.5 ? '2' : '3'),
  },

  Role: {
    _qty: 0,
  },

  RoleEdge: {
    _qty: 0,
  },

  SubordinateToRole: {
    _qty: 0,
  },

  Avatar: {
    _qty: 0,
  },

  Report: {
    _qty: 100,
    userId: 'User',
    title: () => faker.lorem.words(5),
    projectId: 'Project',
    working_today: () => faker.lorem.words(10),
    working_hours: () => '05:00',
    result: () => faker.lorem.words(10),
    issue: () => faker.lorem.words(10),
    tasks: () => faker.lorem.words(10),
    plans: () => faker.lorem.words(10),
  },

  Request: {
    _qty: 50,
    type: () => Math.random() > 0.5 ? ERequestType.day_off : ERequestType.vacation,
    status: () => {
      const rand = Math.random();
      if (rand <= 0.2) {
        return ERequestStatus.approved
      }
      if (rand <= 0.4) {
        return ERequestStatus.fulfilled
      }
      if (rand <= 0.6) {
        return ERequestStatus.on_review
      }
      if (rand <= 0.8) {
        return ERequestStatus.rejected
      }
      if (rand <= 1) {
        return ERequestStatus.unfulfilled
      }
    },
    start: () => {
      const rand = Number((Math.random() * 10).toFixed(0))
      const date = new Date();

      date.setDate(date.getDate() - rand)

      return date;
    },
    end: () => {
      const rand = Number((Math.random() * 10).toFixed(0))
      const date = new Date();

      date.setDate(date.getDate() + rand)

      return date;
    },
    requester_id: 'User'
  },
  Approver: {
    _qty: 150,
    approver_id: 'User',
    project_id: 'Project',
    request_id: 'Request',
    is_approved: () => Math.random() > 0.5 ? true : false,
    approved_at: () => faker.date.future()
  },

  SystemSettings: {
    _qty: 0,
  },
};

// Get Prisma models list with metadata
const queue = [...Prisma.dmmf.datamodel.models];

const generateSeeds = async () => {
  queue.forEach((model) => {
    // take current model generators
    const modelGenerators = generators[model.name as keyof typeof generators] as any;

    const seeds = [];

    console.log(model.name, modelGenerators);

    if (!modelGenerators) return;

    // Finally generate seeds for particular model
    for (let i = 0; i < modelGenerators._qty; i++) {
      const seed = model.fields.reduce((seedData, field) => {
        const generator = modelGenerators[field.name as keyof typeof modelGenerators] as string | Function | undefined;

        if (typeof generator === 'function') {
          return {
            ...seedData,
            [field.name]: generator(i),
          };
        }

        if (typeof generator === 'string') {
          return {
            ...seedData,
            [field.name]: { type: generator },
          };
        }

        return seedData;
      }, {});

      seeds.push(seed);
    }

    // Format and write to json file.
    const json = JSON.stringify(seeds, null, 2);
    fs.writeFile(`${__dirname}/data/${model.name}.json`, json, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
};

generateSeeds()
  .then(() => {
    console.log('Generated new seed data to database/seeds/data directory');
  })
  .catch((err) => {
    console.log(err);
  });
