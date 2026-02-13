const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Token não encontrado. Acesso negado.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log(payload)
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};