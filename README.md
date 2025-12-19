# E22
basically twitter for horses 🐎🐴 (without most of the features)

## Features
- session based auth (register, login, logout)
- user profiles 
- posting your horsey thoughts
- replying to other horses
- editing your horsey thoughts if you change your mind
- you can even delete your horsey thoughts (or your entire account)
- searching for posts with filtering and sorting options

## Endpoints

> almost everything requires you to be logged in

### Pages (GET)
| Endpoint | Description |
|----------|-------------|
| `/` | Home - redirects to profile or register |
| `/register` | registration page |
| `/login` | login page |
| `/logout` | logout and redirect |
| `/horse/:handle` | user profile page |
| `/horse/:handle/edit` | edit user profile |
| `/horse/:handle/post/:post` | view single post |
| `/post/:post` | short redirect to post |
| `/post/:post/edit` | edit post page |
| `/search` | search posts page |

### API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | register new user |
| `/api/login` | POST | login |
| `/api/validate-handle` | POST | check if handle is valid and available |
| `/api/post/new` | POST | create new post |
| `/api/post/:post` | GET | get json post data |
| `/api/post/:post/edit` | POST | edit a post |
| `/api/post/:post/delete` | POST | delete a post |
| `/api/post/:post/reply` | POST | reply to a post |
| `/horse/:handle/delete` | POST | delete account |

## Tech used
- Node.js
- Express.js
- MongoDB
- EJS
- Preact
- Docker

## Prerequisites
- Node.js
- MongoDB
- Docker (optional)

## Running with docker-compose
```
git clone https://github.com/yakkudev/E22.git
cd E22
docker compose up
```

## Running the dev environment
```
git clone https://github.com/yakkudev/E22.git
cd E22
npm install
```
have mongodb running in the background or start it with
```
docker compose up mongo
```
start the server with
```
npm start
```
if you want hot reloading you can run 
```
npm run dev
```
# Authors
me [(dominik brewka)](https://github.com/yakkudev)

# LICENSE
GNU GENERAL PUBLIC LICENSE VERSION 3
check out [LICENSE](./LICENSE) for more info