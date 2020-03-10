import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';

import authMiddleware from './app/middlewares/auth';
import adminMiddleware from './app/middlewares/admin';

const routes = new Router();
const upload = multer(multerConfig);

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

/**
 * Rota para upload de arquivos
 */
routes.post('/files', upload.single('file'), FileController.store);

/**
 * Rota para entregadores
 */
routes.post('/deliveryman', DeliverymanController.store);
routes.get('/deliveryman', DeliverymanController.index);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

export default routes;
