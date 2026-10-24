# B Bharath — Portfolio Website

A responsive React portfolio built with Vite, plain CSS, and Lucide icons. Visual style: cool white, navy, and blue.

## Requirements
- Node.js (LTS recommended): https://nodejs.org/
- A code editor such as VS Code

## Run locally
1. Extract the project folder if you downloaded the ZIP.
2. Open the `bharath-portfolio` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL Vite prints (usually `http://localhost:5173`).

## Important personalisation before publishing
Open `src/main.jsx` and:
- Replace `YOUR_EMAIL@example.com` in the `mailto:` URL with your real email address.
- Replace placeholder `https://github.com/` project links with the correct repositories.
- Verify each project description and technology list matches what you actually built.
- Add your resume PDF to the project and add a download button if you want to share it.

The contact form opens the visitor's default email app; it does not send messages through a backend. For a real web form, connect a form service or backend.

## Build for production

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`.

## Deploy
You can deploy this Vite app to Vercel, Netlify, or GitHub Pages. For Vercel/Netlify, import the GitHub repository and use the default Vite build command `npm run build` and output directory `dist`.
