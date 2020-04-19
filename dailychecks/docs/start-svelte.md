Based on this article, with adjustments:
https://fireship.io/lessons/svelte-v3-overview-firebase/

Initialize Svelte from common template:

    npx degit sveltejs/template . --force

Used force because directory already exists.
The command rewrote `.gitignore` and `public/index.html` files.
I manually applied the changes to `.gitignore`,
and the `index.html` probably didn't matter much, kept as is.

    npm install
    npm i rxfire firebase rxjs

Local Svelte server during development,
not compatible with the Firebase local deploy:

    npm run dev

Note: the Firebase local deploy is able to render correct after build,
and hard browser refresh:

    npm run build

Note: different between Cloud Firestore and Firebase Realtime Database:
https://stackoverflow.com/questions/46549766/whats-the-difference-between-cloud-firestore-and-the-firebase-realtime-database

Create `src/firebase.js`:

    import firebase from 'firebase/app';
    import 'firebase/auth';
    import 'firebase/firestore';
    const firebaseConfig = {
        // ...
    };

    firebase.initializeApp(firebaseConfig);

    export const auth = firebase.auth();
    export const googleProvider = new firebase.auth.GoogleAuthProvider();

    export const db = firebase.firestore();

Copy `firebaseConfig` from project settings on Firebase console, **General / Your apps / Web apps / Config**.
