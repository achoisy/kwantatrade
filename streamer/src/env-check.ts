if (!process.env.NATS_CLIENT_ID) {
  throw new Error('NATS_CLIENT_ID must be defined');
}
if (!process.env.NATS_URL) {
  throw new Error('NATS_URL must be defined');
}
if (!process.env.NATS_CLUSTER_ID) {
  throw new Error('NATS_CLUSTER_ID must be defined');
}

if (!process.env.EPIC) {
  throw new Error('EPIC name must be defined');
}

if (!process.env.HOT_MONGO_URI) {
  throw new Error('HOT MONGO URI must be defined');
}

if (!process.env.COLD_MONGO_URI) {
  throw new Error('COLD MONGO URI must be defined');
}

console.log('Environment variable check SUCCESSFULL !');
