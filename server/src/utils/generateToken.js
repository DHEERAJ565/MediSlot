import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'medislot_jwt_super_secret_key_2026_cse_project_secure_hash',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

export default generateToken;
