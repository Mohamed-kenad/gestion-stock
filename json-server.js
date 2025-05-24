// json-server.js
import jsonServer from 'json-server';
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = 3001;

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);

// Add custom middleware for authentication simulation
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/login') {
    const { email, password } = req.body;
    const db = router.db;
    const user = db.get('users').find({ email, password }).value();
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.jsonp({
        user: userWithoutPassword,
        token: 'fake-jwt-token'
      });
    } else {
      res.status(400).jsonp({ message: 'Email or password is incorrect' });
    }
    return;
  }
  
  // Continue to JSON Server router
  next();
});

// Use default router
server.use(router);

// Start server
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
