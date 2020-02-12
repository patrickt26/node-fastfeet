import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { zip_code } = req.body;

    const zipCodeFormated =
      zip_code.indexOf('-') !== -1 ? zip_code.replace('-', '') : zip_code;

    const recipientExists = await Recipient.findOne({
      where: { zip_code: zipCodeFormated },
    });

    if (recipientExists) {
      return res.status(400).json({ error: 'Recipient already exists.' });
    }

    const { name, street, number, complement, state, city } = req.body;

    const { id } = await Recipient.create({
      name,
      street,
      number,
      complement,
      state,
      city,
      zip_code: zipCodeFormated,
    });

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zipCodeFormated,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().notOneOf([null, '']),
      street: Yup.string().notOneOf([null, '']),
      number: Yup.string().notOneOf([null, '']),
      complement: Yup.string().notOneOf([null, '']),
      state: Yup.string().notOneOf([null, '']),
      city: Yup.string().notOneOf([null, '']),
      zip_code: Yup.string().notOneOf([null, '']),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;
    const { zip_code } = req.body;

    const zipCodeFormated =
      zip_code.indexOf('-') !== -1 ? zip_code.replace('-', '') : zip_code;

    const recipient = await Recipient.findByPk(id);

    if (zipCodeFormated && zipCodeFormated !== recipient.zip_code) {
      const recipientExists = await Recipient.findOne({
        where: { zip_code: zipCodeFormated },
      });

      if (recipientExists) {
        return res.status(400).json({ error: 'Recipient already exists.' });
      }
    }

    const { name, street, number, complement, state, city } = req.body;

    const updateRecipient = await recipient.update({
      name,
      street,
      number,
      complement,
      state,
      city,
      zip_code: zipCodeFormated,
    });

    return res.json(updateRecipient);
  }
}

export default new RecipientController();
