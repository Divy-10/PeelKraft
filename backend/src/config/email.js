import nodemailer from 'nodemailer';
import config from './index.js';

const createTransporter = () => {
  const options = {
    service: config.smtp.service || 'gmail',
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  };

  // If service is not specified or custom host is provided without service
  if (config.smtp.host && config.smtp.host !== 'smtp.gmail.com') {
    delete options.service;
    options.host = config.smtp.host;
    options.port = config.smtp.port;
    options.secure = config.smtp.port === 465;
  }

  return nodemailer.createTransport(options);
};

export default createTransporter;
