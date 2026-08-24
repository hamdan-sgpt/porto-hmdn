const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 8080;

// Logging middleware for Pterodactyl console debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from root and subdirectories
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// SPA Fallback: Return index.html ONLY for page requests (not for missing .js/.css/.jpg assets)
app.get('*', (req, res) => {
  // If request looks like a file asset, return explicit 404 instead of returning index.html
  if (/\.(js|css|webp|jpg|jpeg|png|gif|svg|ico|json|woff2?)$/i.test(req.path)) {
    return res.status(404).send(`404: Asset ${req.path} not found on server.`);
  }

  const indexPath = fs.existsSync(path.join(__dirname, 'index.html'))
    ? path.join(__dirname, 'index.html')
    : path.join(__dirname, 'pterodactyl_deploy', 'index.html');

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('404: index.html not found on server.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`Porto Web Server running on port ${PORT}`);
  console.log(`Directory: ${__dirname}`);
  console.log(`=================================`);
});
