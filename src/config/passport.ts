import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

passport.use(
  new LocalStrategy(function verify(username, password, done) {
    (async () => {
      const user = await prisma.user.findUnique({
        where: { username: username },
      });
      if (!user) return done(null, false);
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false);
      return done(null, user);
    })().catch(done);
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: number, done) => {
  (async () => {
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) return done(null, false);
    return done(null, user);
  })().catch(done);
});
