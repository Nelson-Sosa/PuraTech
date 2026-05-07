const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || 'ddkl88iqk',
  api_key: process.env.API_KEY || '462113573857916',
  api_secret: process.env.API_SECRET || 'YWNvJ3NFE-RUkUIsD1cQnFqxrWY',
});

module.exports = cloudinary;
