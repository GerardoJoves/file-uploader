import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import dotenv from 'dotenv';
import prisma from '../lib/prisma.js';

dotenv.config();

export default session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // ms
  },
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, // ms
    dbRecordIdIsSessionId: true,
  }),
});
