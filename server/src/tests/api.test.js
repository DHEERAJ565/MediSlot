import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import app from '../app.js';

let server;
let baseUrl;

describe('MediSlot Backend API Tests', () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medislot_db');
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  test('1. Health check endpoint responds with online status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'online');
    assert.strictEqual(data.service, 'MediSlot Backend API');
  });

  test('2. Public doctor listing returns seeded doctors', async () => {
    const res = await fetch(`${baseUrl}/api/doctors`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.doctors.length >= 8, 'Should return at least 8 doctors');
  });

  test('3. Doctor filter by specialization works', async () => {
    const res = await fetch(`${baseUrl}/api/doctors?specialization=Cardiology`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.doctors.length > 0);
    assert.strictEqual(data.doctors[0].specialization, 'Cardiology');
  });

  test('4. Patient login succeeds with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient@medislot.com',
        password: 'patient123',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token, 'Should return a JWT token');
    assert.strictEqual(data.user.role, 'patient');
    assert.strictEqual(data.user.email, 'patient@medislot.com');
  });

  test('5. Login fails with incorrect password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient@medislot.com',
        password: 'wrongpassword',
      }),
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  test('6. Doctor login returns doctor profile', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'doctor@medislot.com',
        password: 'doctor123',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'doctor');
    assert.ok(data.doctorProfile, 'Should return linked doctorProfile');
  });

  test('7. Slot availability endpoint calculates working slots', async () => {
    // Fetch doctor Rajesh
    const docRes = await fetch(`${baseUrl}/api/doctors?search=Rajesh`);
    const docData = await docRes.json();
    const docId = docData.doctors[0]._id;

    // Check tomorrow's slots
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const slotRes = await fetch(`${baseUrl}/api/appointments/slots/${docId}?date=${tomorrowStr}`);
    assert.strictEqual(slotRes.status, 200);
    const slotData = await slotRes.json();
    assert.strictEqual(slotData.success, true);
    assert.ok(Array.isArray(slotData.slots));
    assert.ok(slotData.slots.length > 0);
  });

  test('8. Live queue endpoint returns clinic queues', async () => {
    const res = await fetch(`${baseUrl}/api/queue/all/live`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.queues));
  });
});
