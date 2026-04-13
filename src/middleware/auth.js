const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // ✅ FIX: Handle both 'Bearer token' and raw token formats
  const authHeader = req.header('Authorization');
  console.log('AUTH - Authorization header:', authHeader ? 'present' : 'MISSING');

  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, access denied' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ msg: 'No token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('AUTH - decoded user id:', decoded.id);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('AUTH - token error:', err.message);
    res.status(401).json({ msg: 'Invalid token' });
  }
};