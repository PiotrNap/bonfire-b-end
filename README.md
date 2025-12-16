## Event Scheduling Service

This README is for developers working on (but not included) or integrating with the Bonfire frontend mobile app.

### What it is

This REST service serves as a backend infrastructure for event scheduling applications with Cardano-based wallets.
It allows for user registration, authenticated event creation, event booking, and scheduled events mangagement.

### What it does

**Auth & Identity:**
- challenge/response user registration
- new device registration 
- access token issuance (JWT)

**Entities**
- serving paginated directory of events
- providing time-scoped information of booked events
- updating user profiles and events

**Content Moderation:**
- recognizes NSFW (Not-safe-for-work) uploaded content 

### What it does NOT do

- sending event booking email confirmations
- confirming crypto payments
- withdrawing user-bound devices

### High-Level Architecture

- Nest.js monolith application
- containerized PostgreSQL database 
- REST endpoints for creating/updating users & events
- challenge/response Tweetnacl validator 
- Tensorflow model for sexy/port content detection

### Tech Stack 

Nest.js, Axios, Tensorflow, Dayjs, Typeorm, Typescript, Jest

### Getting Started

**Node.js:**
The easiest way to manage node versions is with a version manager such as `nvm`.  
We leave it to the developer to install `nvm` or implement another method which can access the `.nvmrc`.  
Minimum required Node.js version is 16.10.0.

**Docker:**
We recommend installing the latest Docker desktop version for local development,
and have it open before running this project.

**Install dependencies:**

```code
yarn
```

**Run the Local Development:**

```code
yarn dev
```

**Troubleshooting:**
In case of Dodcker setup problems, you may need to edit `src/scripts/start-db.sh` depending on your operating system.
(current setup was written for Unix-like OS)

### Usage Examples 

You can adjust things like DB password, username, port, and app port in the local .env file. 
For our examples we'll use this setup

```code
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5436
POSTGRES_USER=postgres
POSTGRES_PASSWORD=superPassword
POSTGRES_DATABASE=bonfire_db
PG_VERSION=18
PORT=8000
MODE=DEV
RUN_MIGRATIONS=1
SYNCHRONIZE=false
SERVER_APP_URL=http://localhost:8000
```

1. Create a new user
```curl
curl -X POST http://localhost:8000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "hourlyRateAda": 0,
    "bio": "Backend developer focused on event systems",
    "profession": "Software Engineer",
    "skills": ["Node.js", "NestJS", "TypeORM", "Cardano"],
    "jobTitle": "Backend Developer",
    "username": "piotr",
    "baseAddresses": [
      "addr1qxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ],
    "walletPublicKey": "wallet_public_key_here",
    "publicKey": "public_key_here"
  }
```

2. Create an event
```curl
curl -X POST http://localhost:8000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<payload>.<signature>" \
  -d '{
    "title": "1:1 Backend Architecture Session",
    "description": "Deep dive into system design, migrations, and fault tolerance",
    "availabilities": [
      { "day": "MONDAY", "from": "09:00", "to": "12:00" },
      { "day": "WEDNESDAY", "from": "14:00", "to": "18:00" }
    ],
    "fromDate": "2025-01-10T00:00:00Z",
    "toDate": "2025-02-10T00:00:00Z",
    "hourlyRate": 120,
    "visibility": "PUBLIC",
    "eventCardColor": "#1E1E1E",
    "eventTitleColor": "#FFFFFF",
    "organizer": { "id": "uuid-of-organizer" },
    "cancellation": {
      "type": "FLEXIBLE",
      "hoursBefore": 24
    },
    "note": "Bring your current architecture diagram",
    "networkId": "cardano-mainnet"
  }'
```

### Generating the schema and migration  

Whenever changes to entities occur, a migration needs to be performed. You do it in the following way:

```code
yarn typeorm:migration:generate -- init  # init can be any migration name

# Before running your project for the first time you need to build it
# $ yarn build

yarn typeorm:migration:run
```  

After successful migration, commit and deploy the new migration file(s).

### Other Useful Links 

Accompanying mobile application [https://github.com/PiotrNap/bonfire-mobile-app](https://github.com/PiotrNap/bonfire-mobile-app)
Escrow smart contract used with the front-end [https://github.com/PiotrNap/escrow-contract](https://github.com/PiotrNap/escrow-contract)
