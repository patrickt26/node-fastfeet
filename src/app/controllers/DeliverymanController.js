import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman already exists' });
    }

    const { id, name, email } = await Deliveryman.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async index(req, res) {
    const deliverymans = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymans);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().notOneOf([null, '']),
      email: Yup.string()
        .email()
        .notOneOf([null, '']),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { id } = req.params;
    const { email } = req.body;

    const deliveryman = await Deliveryman.findByPk(id);

    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Deliveryman.findOne({ where: { email } });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman already exists.' });
      }
    }

    await deliveryman.update(req.body);

    const { name, avatar } = await Deliveryman.findByPk(id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email: deliveryman.email,
      avatar,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryman = Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman not exists' });
    }

    await Deliveryman.destroy({
      where: { id },
    });

    return res.json({
      message: `Deliveryman was deleted from the database`,
    });
  }
}
export default new DeliverymanController();
