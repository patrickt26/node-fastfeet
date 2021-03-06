import User from '../models/User';

export default async (req, res, next) => {
  const user = await User.findOne({
    where: { id: req.userId, admin: true },
  });

  if (!user) {
    return res.status(401).json({ error: 'User has no privilege.' });
  }

  return next();
};
