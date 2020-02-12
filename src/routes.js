import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';

import authMiddleware from './app/middlewares/auth';
import adminMiddleware from './app/middlewares/admin';

const routes = new Router();

/**
 * Criação de usuário
 */
routes.post('/users', UserController.store);
/**
 * Criação de sessão
 */
routes.post('/sessions', SessionController.store);

/**
 * Middleware para validar Token
 */
routes.use(authMiddleware);

/**
 * Alteração em usuário logado
 */
routes.put('/sessions', SessionController.update);

/**
 * Middleware para verificar se usuário é admin
 */
routes.use(adminMiddleware);

/**
 * Alteração em usuário pelo Id
 */
routes.put('/users/:id', UserController.update);

/**
 * Rotas para destinatários
 */
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

export default routes;
