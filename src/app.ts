import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { tranasctionsRoute } from './routes/transactions.js';

export const app = fastify();

app.register(cookie);
app.register(tranasctionsRoute, {
	prefix: 'transactions'
});