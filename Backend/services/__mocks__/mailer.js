// Mock mailer for tests — doesn't actually send emails
const Mailer = jest.fn().mockResolvedValue(undefined);

module.exports = Mailer;
