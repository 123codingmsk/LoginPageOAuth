# LoginPageOAuth
This is a simple authentication application built with Node.js, Express, PostgreSQL, and Passport.js. It allows users to register, log in, and authenticate with local credentials or Google OAuth.

<strong>Features<strong>
<ul>
  <li>User Registration and Login with hashed passwords using bcrypt.</li>
  <li>Local Authentication using Passport's LocalStrategy.</li>
  <li>Google OAuth Authentication using Passport-Google-OAuth2.</li>
  <li>Session Management with express-session.</li>
  <li>Secured Secrets Page only accessible to authenticated users.</li>
  <li>Logout functionality.</li>
</ul>

<strong>Prerequisites<strong>
Before running this project, make sure you have:
<ul>
  <li>Node.js installed</li>
  <li>A Google Developer Account for OAuth setup (Google Cloud Platform)</li>
  <li>PostgreSQL installed and running</li>
</ul>
<hr>
<p>Environment Variables Setup</p>
<ol>
  <li>Create a .env file in the root directory</li>
  <p>
    SESSION_SECRET=topsecret
    PG_USER=postgres
    PG_PASSWORD=yourpassword
    PG_HOST=localhost
    PG_DATABASE=secrets
    PG_PORT=5432
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
  </p>
  <p>Replace all these with your respective credentials.</p>
</ol>
<strong>Installation</strong>
<ol>
  <li>Clone the project.</li>
  <li>Navigate to the repository.</li>
  <li>Install the dependencies.</li>
  <li>Setup the PostgreSQL database.</li>
</ol>

<strong>API Endpoints</strong>
<p>GET/, GET/login, POST/login, POST/register, GET/register, GET/secrets, GET/logout, GET/auth/google, GET/auth/google/secrets</p>

<strong>Technologies Used:</strong>
<p>Node.js, Express.js, PostgreSQL, Passport.js, bcrypt, EJS</p>






