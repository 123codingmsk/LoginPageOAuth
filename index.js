import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import bcrypt from 'bcrypt';
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from 'passport-google-oauth2'; ///OAuth
import 'dotenv/config';

const db = new pg.Client({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
});
db.connect();

const app = express();
const port = 3000;
const saltrounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); 
//initialize the session first-----> 1st step for auth,sess,cook  6 steps involved in this
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  },
}));

//now use the passport lib to initialize the session ---->2nd step
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

//to authenticate the profile using api
app.get('/auth/google', passport.authenticate('google',{
  scope: ['profile','email'],
  })
);
//to redirect into secrets page we need to authenicate & specify
app.get('/auth/google/secrets', passport.authenticate('google',{
  successRedirect: '/secrets',
  failureRedirect: '/login',
}));

//for cookies session who wants to directly login   -->6th step
app.get('/secrets', async (req, res)=>{
  if(req.isAuthenticated()){
   res.render('secrets.ejs');
  }else{
    res.redirect('/login');
  }
});

//logout from application
app.get('/logout',(req,res)=>{
  req.logout((err)=>{
    if(err) console.log(err);
    res.redirect('/');
  })
});

app.post("/login", passport.authenticate('local',{   //->>>5th step
  successRedirect: '/secrets',
  failureRedirect: '/login',
}));

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try {
    const checkduplicates = await db.query('select * from users where email = $1',[email]);
    if(checkduplicates.rows.length > 0){
      res.redirect('/login');
    } else{
      //password hashing
        bcrypt.hash(password, saltrounds, async (error,hash)=>{
          if(error){
            console.log('Error hashing the password!',error);
            res.status(500).send(`Internal server error!`);
          }else{
            const result = await db.query('insert into users (email,password) values($1, $2) returning *',[email,hash]);
            const user = result.rows[0];
            req.login(user, (err)=>{
              console.log(err);
              res.redirect('/secrets');
            });
          }  
        });     
      }
  } catch (error) {
    console.log(`Error during registration`,error);
    res.send(`Error occurred during registration!`).status(500);
  }
});

//building strategies ---->3rd step
passport.use('local', new Strategy(async function verify(username, password, cb){
  //it automatically grabs the username & password from website when users enters
  try {
    const checkemail = await db.query('select * from users where email = $1',[username]);
    if(checkemail.rows.length > 0){
      const user = checkemail.rows[0];
      const dbhashedpassword = user.password;
      //comparing the hashed passsword & user entered password for more safety
      bcrypt.compare(password, dbhashedpassword, (error, valid)=>{
        if(error){
          console.error('Error during password comparison:', error);
          return cb(error);
        }else{
          if(valid){
            return cb(null, user);
          }else{
            return cb(null, false);
          }
        }
      });
    }else{
      console.log(`email not found!`);
      return cb('Email not found! :(');
    }
  } catch (error) {
    console.log(`error durinig authentication!`);
    return cb(error);
  }
}));  //it is used when authenticate function is called    
//************************important: always strategy required before autheticate function is called.
///only for hashed passwords this function works...


//building strategy for the accessing google api and storing in our database.
passport.use('google',new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/secrets',
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  }, async (accessToken, refreshToken, profile, cb)=>{
    console.log(profile);
    try {
      const result = await db.query('select * from users where email=$1',[profile.email]);
      if(result.rows.length === 0){
        const newUser = await db.query('insert into users (email, password) values ($1,$2)',[profile.email, 'google']);
        cb(null, newUser.rows[0]);
      }else{
        //already existing user
        cb(null, result.rows[0]);
      }
    } catch (error) {
      cb(error);
    }
  })
);

//serialize the user  ----->4th step
passport.serializeUser((user, cb)=>{        ////these store the full-user object information
  cb(null, user.id);
});
//deserialize the user
passport.deserializeUser((user, cb)=>{       //instead we can use them to store only user.id, efficient
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
