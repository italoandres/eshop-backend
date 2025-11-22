// Middleware simples de autenticação para admin
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ message: 'Token inválido' });
  }

  next();
};

module.exports = authMiddleware;
