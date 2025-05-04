# restaurants API REST

## Backend

### Tools used

* **Express**: to expose the BackEnd server APIs with a routing framework built-in the library.
* **TypeORM**: to implement the relational database schema in the application layer supported by ORM features.
* **PostgreSQL**: relational database system.
* **Axios**: for making external REST requests.
* **Bcrypt**: cyphering library.
* **JWT**: handles authentication and authorization of the BackEnd APIs.
* **Joi**: validates REST request body and query-params.
* **Jest**: integrates with `ts-jest` for the implementation of unit tests.
* **Redis**: used for caching external API results or managing user sessions.

---

## Instructions to run the backend server

### Deploy with docker.  
    just run ```docker-compose up -d``` in terminal in the root directory

### Deploy on local machine

1. **PostgreSQL Setup**
   1.1 Connect your local machine to a PostgreSQL server.
   1.2 Create a new connection in localhost that matches the configuration in `./ormconfig.ts`.
   1.3 Create two databases:

   * `db` (for development)
   * `db_test` (for integration testing)

2. **Redis Setup (Local)**
   2.1 Install Redis locally:

   On Ubuntu/Debian:

   ```bash
   sudo apt update
   sudo apt install redis-server
   ```

   On macOS (using Homebrew):

   ```bash
   brew install redis
   brew services start redis
   ```

   On Windows:
   You can use [Memurai](https://www.memurai.com/) or [install Redis via WSL](https://docs.microsoft.com/en-us/windows/wsl/install).

   2.2 Confirm Redis is running:

   ```bash
   redis-cli ping
   # Expected output: PONG
   ```

3. **Install dependencies and run**

   ```bash
   npm install
   npm run start
   ```

### Docs

You can explore the API using the provided Postman collection.

1. Import `Prueba Tyba.postman_collection.json` into Postman.
2. Create an environment variable named `basicUrl` with the value `http://localhost:8080`.

