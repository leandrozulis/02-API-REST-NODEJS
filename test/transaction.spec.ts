import request from 'supertest';
import { execSync } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { beforeEach } from 'node:test';

describe('Teste de rotas', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('Teste rota POST de criação', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Test envio',
        amount: 5000,
        type: 'credit'
      }).expect(201);
  });

  it('Teste rota GET listando todas transactions', async () => {
    const createTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Test envio',
        amount: 5000,
        type: 'credit'
      });

    const cookie = createTransaction.get('Set-Cookie');

    const res = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Test envio',
        amount: 5000,
      })
    ]);
  });

  it('Teste rota GET listando uma única transactions', async () => {
    const createTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Test envio',
        amount: 5000,
        type: 'credit'
      });

    const cookie = createTransaction.get('Set-Cookie');

    const res = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)
      .expect(200);
    
    const id = res.body.transactions[0].id;

    const resp = await request(app.server)
      .get(`/transactions/${id}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(resp.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Test envio',
        amount: 5000,
      })
    );
  });

  it('Teste rota GET listando todas transactions', async () => {
    const createTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Test envio',
        amount: 5000,
        type: 'credit'
      });

    const cookie = createTransaction.get('Set-Cookie');

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookie)
      .send({
        title: 'Test envio',
        amount: 3000,
        type: 'debit'
      });

    const res = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body.summary).toEqual(
      expect.objectContaining({
        amount: 2000,
      })
    );
  });
});