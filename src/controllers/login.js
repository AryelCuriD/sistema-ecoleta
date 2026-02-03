const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '1h';

module.exports = async (req, res, USERS) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username e password são necessários' });
  }
  const user = USERS.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  const senhaValida = await bcrypt.compare(password, user.password);
  if (!senhaValida) return res.status(401).json({ error: 'Senha incorreta' });
  const payload = { id: user.id, username: user.username, name: user.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
  res.json({ message: 'Login realizado com sucesso' });
};
