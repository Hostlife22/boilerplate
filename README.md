# Boilerplate

## React + Remix + Typescript + Prisma

Comes with user authentication included

- [React](https://github.com/facebook/react)
- [Prisma](https://www.prisma.io)
- [Remix](https://remix.run)
- TypeScript
- Postgres/MySQL
- Tailwind
- ESLint
- Prettier
- Resend (emails)

& many more tasty treats

## Get Started

**Must have node and pnpm installed and setup locally**

1. `pnpm i`
2. Create db and add connection string to .env, we use PlanetScale
3. `cd packages/database pnpm db:push`

Make sure you have created a .env file with the right values, you can use .env.example as the template

## Development

`pnpm run dev`

## Production

### Mailers

- Create a Resend account and set a RESEND_API_KEY environment variable in .env

### Deployment

We are using Vercel
