## Getting Started

install all the dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

run the docker for the database

```bash
docker compose up
```

adjust the .env file with the database url

```bash
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydatabase"
```
