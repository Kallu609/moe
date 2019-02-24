const config = {
  username: process.env.MOEE_USERNAME || '',
  password: process.env.MOEE_PASSWORD || '',
  captchaApiKey: process.env['2CAPTCHA_API_KEY'] || '',
};

export default config;
