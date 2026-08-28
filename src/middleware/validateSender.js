module.exports = function validateSender(req, res, next) {
  const { full_name, email } = req.body;
  const errors = [];

  if (!full_name || !full_name.trim()) errors.push('Full name is required.');
  if (!email || !email.trim()) errors.push('Email is required.');
  if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) errors.push('Email is invalid.');

  if (errors.length) return res.status(400).json({ errors });
  next();
};
