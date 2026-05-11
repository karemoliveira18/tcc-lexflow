const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId, email, perfil) => {
  return jwt.sign(
    { userId, email, perfil },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: '7d' }
  );
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken
};
