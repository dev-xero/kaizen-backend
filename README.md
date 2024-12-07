# Kaizen 改 善 — Backend

Source code for Kaizen's backend. Kaizen is a web-native collaborative task management software for humans™. Provides a web API that the client uses to function and perform various tasks. Developed as a NitHub final project submission.

## Features

- Supports creating tasks with priorities, and due dates.
- Supports teams for collaborative task management.
- User management system and access controls.
- Secure authentication and authorization via JWT access tokens.

## Technical Information

- Sensitive endpoints require authorization via access tokens.
- Passwords are hashed before storing in the database.
- User verification is required before accessing protected endpoints, users are verified via email.
- Adheres to industry best practices with abstraction and encapsulation via OOP.
- Rate limiting to minimize / prevent API abuse.
- Deployment via Docker images.

## Technologies Used

- NodeJS (Typescript & ExpressJS): asynchronous server-side js runtime engine.
- PostgreSQL: for primary persistent application data.
- Prisma: ORM for working with PostgreSQL.
- Redis: for fast key-value caching.
- MailerSend: for sending emails securely.
- Docker: for containerization & deployments.

## API Endpoints

An overview of API endpoints that are available. The core API features are accessible through the `/v1` prefix.

1. Base:
   1. [GET] `/` - Base endpoint, returns 200 OK if the server is running.

   2. [GET] `/health` - Used to check API health status, 200 if server is healthy.

2. Authentication:
   1. [POST] `/auth/signup` - Validates credentials and attempts to create a new Kaizen user.

   2. [POST] `/auth/signin` - Validates credentials and attempts to login authorized users. Will generate a verification link if the user is not verified.

   3. [POST] `/auth/generate` - This endpoint generates verification links for successfully created users. The link is only valid for 24 hours.

3. Email:
   1. [GET] `/email/verify` - This endpoint attempts to verify users based on a previously generated code. 

4. User:
   1. [GET] `/user/info/:username` - This endpoint returns information about the currently authorized user, rejects the request otherwise.
   
5. Task:
    1. [GET] `/task/personal/:username` - Returns all tasks belonging to the authorized user, rejects the request otherwise.

    2. [POST] `/task/personal/:username` - Creates a personal task for the currently authorized user, rejects otherwise.

    3. [PATCH] `/task/personal/:username` - Batch updates the currently authorized user tasks, rejects request otherwise.
    
    4. [DELETE] `/task/personal/:username?id=ID` - Deletes a singular task with the provided id for the authorized user, rejects request otherwise.

## Configuration (Linux & Unix Environments)

After cloning the repository, you can setup a local instance by following these steps:

1. install npm packages using `yarn install`.
2. Configure environment variables using the .env.example template, see the configuration options [here](#environment-variables).
3. Perform database migrations using `./scripts/db.sh --migrate`, after generating a Prisma client via `npx prisma generate`.
4. Start the development server using `./scripts/dev.sh`.

These scripts need execution permission which you can grant using `chmod +x <path-to-script>`

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| PORT | 8080 | Server port. |
| HOSTNAME | localhost | The hostname of the deployed instance or localhost. |
| ENVIRONMENT | dev | The environment the server is running from. |
| DEPLOYED_URL | http://localhost:8080/v1 | Full URL of the deployed instance or localhost, prefixed with `v1`. |
| CLIENT_URL | http://localhost:3000 | Full URL of the deployed web client. |
| DATABASE_URL | | PostgreSQL database connection URL (pooled). |
| DIRECT_URL | | PostgreSQL non-pooled connection URL. |
| REDIS_URI | | Redis server connection URI. |
| ACCESS_TOKEN_SECRET | | Access token secret key. |
| REFRESH_TOKEN_SECRET | | Refresh token secret key. |
| EMAIL_VERIFICATION_SECRET | | Email verification secret key. |
| MAILSERVICE_API_KEY | | API key for the mailing service. (mailersend) |
| KAIZEN_EMAIL | | Address to send emails from. |
| KAIZEN_EMAIL_NAME | | Email sender name. |

