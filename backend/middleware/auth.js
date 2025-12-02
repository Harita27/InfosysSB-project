const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

// Keep backward compatibility
const auth = authenticate;

module.exports = { authenticate, authorize, auth };
