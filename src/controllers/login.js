const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '1h';

module.exports = async (req, res, USERS) => {
  const { email, password, rememberMe } = req.body || {};

  if (!email|| !password) {
    return res.status(400).json({ error: 'username e password são necessários' });
  }

  const user = USERS.find(u => u.email === email)
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const senhaValida = await bcrypt.compare(password, user.password);
  if (!senhaValida) return res.status(401).json({ error: 'Senha incorreta' });

  const payload = { id: String(user._id), email: user.email };

  const expiresIn = rememberMe ? '30d' : TOKEN_EXPIRY;
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
  };

  if (rememberMe) {
    cookieOptions.maxAge = 30 * 24  * 60 * 60 * 1000
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

  return res.cookie('token', token, cookieOptions).json({ message: 'Login realizado com sucesso' });
};