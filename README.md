# kwantatrade

Service d’acquisition de données indices ticks CFD du Broker IG 

> Architecture en Microservices. 
> NATS Streaming Server. 
> 2 bases de données NoSql Mongodb (Hot et Cold)
> Optimisation des ressources système

Framework:
 - Typescript
 - Nodejs
 - Socket.io
 - Axios
 
Lib: 
 - lightstreamer-client

Messaging Server:
 - NATS Streaming Server

DB:
 - MongoDB
 - Mongoose

Code formating and testing:
  - Eslint
  - Prettier
  - Jest

Monitoring:
 - Prometheus
 - Grafana

Infra:
 - Skaffold
 - Kubernetes Kapsule
 - Docker
 - Github Workflow
 - PM2
