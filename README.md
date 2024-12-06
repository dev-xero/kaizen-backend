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

