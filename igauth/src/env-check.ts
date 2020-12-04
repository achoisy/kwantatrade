if (!process.env.IG_USERNAME) {
  throw new Error('IG username credential must be defined');
}
if (!process.env.IG_PASSWORD) {
  throw new Error('IG password credential must be defined');
}
if (!process.env.IG_API_KEY) {
  throw new Error('IG api key credential must be defined');
}
if (!process.env.IG_URL) {
  throw new Error('IG connection url must be defined');
}
if (!process.env.NATS_CLIENT_ID) {
  throw new Error('NATS_CLIENT_ID must be defined');
}
if (!process.env.NATS_URL) {
  throw new Error('NATS_URL must be defined');
}
if (!process.env.NATS_CLUSTER_ID) {
  throw new Error('NATS_CLUSTER_ID must be defined');
}

console.log('Environment variable check SUCCESSFULL !');
