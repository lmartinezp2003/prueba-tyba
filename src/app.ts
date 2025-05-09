import 'dotenv/config';
import * as express from 'express';
import { EntityManager } from 'typeorm';
import errorMiddleware from './wrapper/error';
import { DatabaseConnection } from './database/db';
import { Server } from 'http';
import { AppController, AppService, Controller } from './common/appCommonTypes';

class App {
    public app: express.Application;
    public port: string | number;
    public databaseConnection: DatabaseConnection;
    public controllers: Controller[];
    public server: Server;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.port = process.env.PORT || 8080;
        this.controllers = controllers;

        this.initializeMiddlewares();
        this.initializeErrorHandling();
        this.initializeRoutes(this.controllers);
    }

    /**
     * Initializes the middlewares
     */
    private initializeMiddlewares() {
        this.app.use(require('cors')());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    /**
     * Initializes the controllers
     * @param controllers
     */
    private initializeRoutes(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    /**
     * Initializes the error handling
     */
    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    /**
     * Initializes the database connection
     */
    private async initializeConnection() {
        try {
            this.databaseConnection = await DatabaseConnection.getInstance();
        } catch (error) {
            console.log('Error connecting to db', error);
        }
    }

    /**
     * Starts the server
     */
    public async listen() {
        await this.initializeConnection();
        this.server = this.app.listen(this.port, () => {
            console.log(`\n🚀 App listening on the port ${this.port}`);
        });
    }

    public getController<S extends AppService>(service: S): AppController[S] {
        return this.controllers.find((controller) => controller.service === service) as AppController[S];
    }

    /**
     * Returns the server
     * @returns {express.Application}
     */
    public getServer(): express.Application {
        return this.app;
    }

    /**
     * Returns the database manager
     * @returns {EntityManager}
     */
    public getDatabaseManager(): EntityManager {
        return this.databaseConnection.getConnectionManager();
    }

    /**
     * Logs all the available routes
     */
    public getAvailableRoutes(): void {
        this.controllers.forEach((controller) => {
            controller.getAvailableRoutes();
        });
    }

    /**
     * Closes the http server
     */
    public async close(): Promise<void> {
        this.server.close();
    }
}

export default App;
