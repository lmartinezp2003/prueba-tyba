import 'dotenv/config';
import App from './app';
import { AppService } from './common/appCommonTypes';
import { UserController } from './services/user/userController';

const app = new App([new UserController()]);

// IIFE to start the server
(async () => {
    // start server
    await app.listen();
    // show available routes
    app.getAvailableRoutes();
})();
