import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export default generateToken;
