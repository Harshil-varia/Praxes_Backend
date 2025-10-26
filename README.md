-- Telemedicine Messages API

Backend system for patient-doctor messaging in virtual consultations. Built for Praxes coding challenge.

-- What You're Looking At

This is a simple REST API that lets patients and doctors exchange messages during telemedicine consultations. There's also a basic frontend to test it out visually.

**Core features:**
- Send messages to a consultation
- View message history
- Filter by sender (patient/doctor only)
- Create new consultations on the fly

## Before You Start

Make sure you have these installed:

1. **Docker Desktop** - Get it from docker.com/products/docker-desktop
   - After installing, **open Docker Desktop and let it fully start** (you'll see the whale icon in your system tray)
   - Wait until it says "Docker Desktop is running"

2. **Node.js** (v16+) - Download from nodejs.org if you don't have it

That's it. Docker handles the database.



## Getting Started

### 1. Install Dependencies

Open your terminal and go to the project folder:

cd praxes_backend/backend
npm install
cd ..


This installs Express, PostgreSQL driver, etc.

### 2. Make Sure Docker is Running

**This is important:** Open Docker Desktop and wait until it says it's running. You'll see the Docker whale icon in your menu bar/system tray.

### 3. Start Everything

From the `praxes_backend/` directory (the root):

docker-compose up

You'll see a bunch of logs. Wait for:
Database ready
Server running on http://localhost:3001

**Keep this terminal open.** Open a new terminal window for the rest of the steps.

### 4. Add Sample Data

In your **new terminal**, from the project root:

curl -X POST http://localhost:3001/dev/seed

Should return: `{"message":"Database seeded successfully"}`

This creates:
- 2 consultations (P123+D456, P789+D012)
- 14 messages between them

### 5. Check the Frontend

Open your browser: http://localhost:3000

You'll see the UI with two options:
- Create New Consultation - Make your own patient/doctor pair
- Use Existing Consultation - Pick from the seeded ones

Try both! The dropdown automatically refreshes when you switch modes, so if you create a new consultation and then switch to "Use Existing", you'll see it in the list.

## Testing the API

You can use curl (examples below) or import these into Postman.

### List All Consultations
curl http://localhost:3001/api/consultations

Example response:
{
"success": true,
"count": 2,
"data": [
{
"id": "abc123-def456-...",
"patientId": "P123",
"doctorId": "D456",
"status": "active",
"createdAt": "2025-10-25T..."
}
]
}

Copy one of those IDs for the next tests.

### Get Messages

Replace `<ID>` with an actual consultation ID:

curl http://localhost:3001/api/consultations/<ID>/messages


Returns all messages in that consultation, oldest first.

### Filter Messages

Only see patient messages:
curl "http://localhost:3001/api/consultations/<ID>/messages?role=patient"

Or doctor messages:
curl "http://localhost:3001/api/consultations/<ID>/messages?role=doctor"

Note the quotes around the URL when using query params in curl.

### Send a Message

curl -X POST http://localhost:3001/api/messages
-H "Content-Type: application/json"
-d '{
"consultationId": "<ID>",
"senderId": "P123",
"senderRole": "patient",
"content": "My headache is better today"
}'

**Important:** The API validates that your `senderId` and `senderRole` match. If you claim to be the patient but use the doctor's ID, you'll get an error.

### Create Your Own Consultation
curl -X POST http://localhost:3001/api/consultations
-H "Content-Type: application/json"
-d '{
"patientId": "P999",
"doctorId": "D888"
}'


Returns the new consultation with its ID. Use that ID to send messages.

## Using Postman Instead

If you prefer Postman to curl:

1. Open Postman
2. Create new request
3. Set URL: `http://localhost:3001/api/...`
4. For POST requests:
   - Click "Body" tab
   - Select "raw" and "JSON"
   - Paste the JSON
5. Hit Send

Way easier for repeated testing.

## Frontend Features

The UI lets you:
- Toggle between creating new consultations or using existing ones
- See the consultation ID with a copy button
- Filter messages by role
- Pick whether you're sending as patient or doctor
- Auto-refreshes the dropdown when switching modes

## Error Examples

The API returns proper error codes:

**Missing fields (400):**
curl -X POST http://localhost:3001/api/messages
-H "Content-Type: application/json"
-d '{"consultationId": "abc"}'

Returns: `{"error": "Missing required fields: consultationId, senderId, senderRole, content"}`

**Wrong role (400):**
Trying to send as doctor when you're actually the patient:
{"error": "Role mismatch: you are a patient, not a doctor"}


**Consultation doesn't exist (404):**
{"error": "Consultation not found"}


## How I Built This

### Data Model

Two tables:

**consultations:**
- Represents a conversation between one patient and one doctor
- Each has a UUID, patient_id, doctor_id, status

**messages:**
- Belongs to a consultation
- Has sender_id, message text, timestamp
- **No sender_role column** - I derive it at query time

### Why Not Store the Role?

I compare `sender_id` with the consultation's `patient_id` and `doctor_id` to figure out if they're a patient or doctor. This means:
- Can't fake your role
- No redundant data
- Automatically consistent

Downside: Slightly more complex queries, but worth it for data integrity.

### Indexes

Added indexes on:
- `messages.consultation_id` - fast lookups
- `messages.sent_at` - chronological ordering

### Tech Stack

**Node + Express:** Fast to develop with, good for I/O-heavy workloads

**PostgreSQL:** Proper relational database with foreign keys and UUIDs. Healthcare data needs ACID compliance.

**Docker:** Makes setup dead simple. No fiddling with local Postgres installations.

## If This Were Production

Here's what I'd add:

**Security:**
- JWT authentication
- Authorization checks (can only see your own consultations)
- Rate limiting
- HTTPS only
- HIPAA compliance (encrypted at rest, audit logs)

**Performance:**
- Redis caching for recent messages
- Pagination (don't return all messages at once)
- Connection pooling (already using pg.Pool)
- CDN for static assets

**Reliability:**
- Proper logging (Winston or Pino)
- Error tracking (Sentry)
- Monitoring/alerts
- Database backups
- Health checks that actually verify DB connectivity

**Features:**
- Message read receipts
- Real-time updates (WebSockets)
- File attachments
- Message editing history
- Soft deletes for audit trail

## Troubleshooting

**"Port 3001 already in use"**

Something else is using that port. Find and kill it:
lsof -i :3001
kill -9 <PID>

Or change the port in docker-compose.yml.

**Docker won't start**

Make sure Docker Desktop is actually running. The app icon should show it's active.

**Can't seed data**

Wait for the "Server running" message before seeding. The database needs to be ready.

**Frontend shows blank**

Check if backend is up:

curl http://localhost:3001/health

Should return `{"status":"running",...}`

## Stopping Everything

In the terminal running docker-compose, hit `Ctrl+C`. Then:

docker-compose down
This stops and removes containers. Your data is saved in a Docker volume.

To wipe everything including data:
docker-compose down -v


## Time Spent

About  hours total. Most time went into:
- Data model design (deriving roles vs storing them)
- Validation logic (ensuring role matches sender)
- Frontend toggle between create/pick modes

## Assumptions

- One patient, one doctor per consultation
- Messages can't be edited or deleted
- No authentication needed for demo
- User IDs are simple strings like "P123"
- Server timezone for timestamps (would use user timezone in prod)

## What I'd Change

With more time:
- Add comprehensive tests
- Better error messages with codes
- WebSocket support for real-time
- Message attachments
- More polished frontend

That's it! If something doesn't work or you have questions, let me know.
