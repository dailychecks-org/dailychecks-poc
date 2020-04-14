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

