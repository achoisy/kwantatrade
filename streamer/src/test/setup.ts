import { MongoMemoryServer } from 'mongodb-memory-server';
import { mongoWrapper } from '@quantatrading/common';

let mongoHotServer: MongoMemoryServer;
let mongoColdServer: MongoMemoryServer;

beforeAll(async () => {
  mongoHotServer = new MongoMemoryServer();
  mongoColdServer = new MongoMemoryServer();

  const mongoHotUri = await mongoHotServer.getUri();
  const mongoColdUri = await mongoColdServer.getUri();

  // Connect to mongoDb cold and hot database
  await mongoWrapper.connect({
    hotMongoUri: mongoHotUri,
    coldMongoUri: mongoColdUri,
  });
});

beforeEach(async () => {
  await mongoWrapper.hotMongo.dropDatabase();
  await mongoWrapper.coldMongo.dropDatabase();
});

afterAll(async () => {
  await mongoHotServer.stop();
  await mongoColdServer.stop();
  await mongoWrapper.close();
});
