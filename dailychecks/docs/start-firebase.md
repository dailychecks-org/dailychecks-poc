Bootstrapping the project
=========================

The steps I used to create the project, and details of the setup.

Initial setup
-------------

Create Firebase project on the [Firebase Console](https://console.firebase.google.com/)

Add a web app to the project. Enable the Firebase Hosting option.

Add Firebase SDK; code is provided during setup:

    <!-- The core Firebase JS SDK is always required and must be listed first -->
    <script src="/__/firebase/7.14.0/firebase-app.js"></script>

    <!-- TODO: Add SDKs for Firebase products that you want to use
         https://firebase.google.com/docs/web/setup#available-libraries -->
    <script src="/__/firebase/7.14.0/firebase-analytics.js"></script>

    <!-- Initialize Firebase -->
    <script src="/__/firebase/init.js"></script>

Install Firebase CLI:

    npm install -g firebase-tools

Deploy to Firebase Hosting:

    firebase login

    # in a new empty dir
    firebase init
    # select Database, Hosting; let it create files it suggest

    firebase deploy
    # https://dailychecks-85f53.web.app/

Add dailychecks.janosgyerik.com custom domain:

- On Firebase Console, go to Hosting
- Click **Add custom domain** and follow the steps
  - To verify ownership of the domain name, it asked to add a TXT record to DNS settings of janosgyerik.com (at Dreamhost)
  - To register Firebase Hosting IP addresses with the DNS, it asked to add A records to DNS settings
- The activation of the domain takes some time
  - The Firebase Console shows the added domain in **Pending** status, with an info message that propagating DNS changes could take up to 24 hours
  - It took a few minutes until the name could be found, and then it had HTTPS certificate issues
  - It took a couple more minutes to have the proper HTTPS certificates

Set up Cloud Storage:

- Selected location: `eur3 (europe-west)`; cannot be changed later
- Actually, it seems this step was not needed at all.
  The "regular" storage is in the **Database** sub-menu.

POC
---

The primitive POC simply lists data in Firebase.

I previously installed firebase tools, but it seemed outdated.
The setup steps include installing them again:

    npm i -g firebase-tools@latest

Had to logout and login again with:

    firebase logout
    firebase login

Launch local server with:

    firebase serve --only hosting

The default database rules don't allow any access.
To give access, updated `database.rules.json`:

    {
      /* Visit https://firebase.google.com/docs/database/security to learn more about security rules. */
      "rules": {
        ".read": true,
        ".write": false
      }
    }

And applied the changed rules with:

    firebase deploy --only database

Then pushed some dummy data with:

    firebase database:set / ../web-start/initial_messages.json

And implemented the most primitive possible listing with a primitive query:

    const query = firebase.database() .ref(`/messages/`);
    query.on('child_added', callback);
    query.on('child_changed', callback);

Where `callback` is a `function (snap) { ... }` that appends to a DIV in the DOM.

The coolness of Firebase: with the above code in place, add more messages in the database, and it will trigger a call to callback.

To test login, I added this temporarily:

    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);

I had to register sign-in providers in the **Authentication** menu.


Cheat sheet
-----------

    # run the starter app
    firebase serve --only hosting

    # replace database content
    firebase database:set / ./initial_messages.json

    # deploy database rules
    firebase deploy --only database

    # deploy everything except functions (what are functions???)
    firebase deploy --except functions

    # deploy to cloud hosting
    firebase deploy

    # open cloud hosting site
    firebase open hosting:site
