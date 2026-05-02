import { Strategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { envs } from "./envs.js";
import AppDataSource from "../providers/datasource.provider.js";

const JWT_SECRET = envs.JWT_SECRET;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new Strategy(opts, async (payload, done) => {
    try {
      const usuario = await AppDataSource.getRepository("Usuario").findOne({
        where: { id: payload.id },
      });
      if (!usuario) {
        return done(null, false);
      }
      const { password, ...safe } = usuario;
      return done(null, safe);
    } catch (err) {
      return done(err, false);
    }
  })
);
export default passport;
