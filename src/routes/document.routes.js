import express from 'express';

import { createDocument, getAllRespectedUserDocuments, getSingleUserDocument, updateDocument, deleteDocument, addCollaborator, getAllCollaborators, exportDocument} from '../controllers/doc.controller.js';

import validateToken from '../middlewares/auth.middleware.js';

const documentRouter = express.Router();

documentRouter.route('/').get(validateToken, getAllRespectedUserDocuments).post(validateToken, createDocument);
documentRouter.route('/:documentId').get(validateToken, getSingleUserDocument).patch(validateToken, updateDocument).delete(validateToken, deleteDocument);
documentRouter.route('/add-collaborator/:documentId').patch(validateToken, addCollaborator);
documentRouter.route('/get-all-collaborators/:documentId').get(validateToken, getAllCollaborators);
documentRouter.post('/:documentId/export/:format',validateToken, exportDocument);

export default documentRouter;