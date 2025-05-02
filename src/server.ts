import 'dotenv/config';
import App from './app';
import { UserController } from './services/user/userController';
import { SearchController } from './services/search/searchController';

const app = new App([new UserController(), new SearchController()]);

// IIFE to start the server
(async () => {
    // start server
    await app.listen();
    // show available routes
    app.getAvailableRoutes();
})();
