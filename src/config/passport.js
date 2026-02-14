import dotenv from "dotenv";
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth Profile:', {
          id: profile.id,
          email: profile.emails[0]?.value,
          name: profile.displayName
        });

        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('Existing user found:', user.email);
          
          // Update user info in case it changed
          user.name = profile.displayName;
          user.avatar = profile.photos[0]?.value;
          user.email = profile.emails[0]?.value;
          await user.save();
          
          return done(null, user);
        }

        // Create new user if doesn't exist
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
        });

        console.log('New user created:', user.email);
        done(null, user);
      } catch (error) {
        console.error('Passport Google Strategy Error:', error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user._id);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log('Deserializing user:', user?.email);
    done(null, user);
  } catch (error) {
    console.error('Deserialize Error:', error);
    done(error, null);
  }
});

export default passport;