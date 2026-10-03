const { body, validationResult } = require('express-validator');
const { getAllMessages, createMessage, deleteMessage, findMessageById } = require('../db/messageQueries');

async function listMessages(req, res, next) {
  try {
    const messages = await getAllMessages();
    res.render('index', { messages });
  } catch (err) {
    next(err);
  }
}

function getNewMessageForm(req, res) {
  res.render('new-message-form', { errors: [], formData: {} });
}

const validateMessage = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 255 }),
  body('text').trim().notEmpty().withMessage('Message text is required.').isLength({ max: 5000 }),
];

async function postNewMessage(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('new-message-form', {
      errors: errors.array(),
      formData: req.body,
    });
  }

  try {
    await createMessage({
      title: req.body.title,
      text: req.body.text,
      userId: req.user.id,
    });
    res.redirect('/');
  } catch (err) {
    next(err);
  }
}

async function postDeleteMessage(req, res, next) {
  try {
    const message = await findMessageById(req.params.id);
    if (!message) {
      req.flash('error', 'That message no longer exists.');
      return res.redirect('/');
    }
    await deleteMessage(req.params.id);
    req.flash('success', 'Message deleted.');
    res.redirect('/');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMessages,
  getNewMessageForm,
  validateMessage,
  postNewMessage,
  postDeleteMessage,
};
