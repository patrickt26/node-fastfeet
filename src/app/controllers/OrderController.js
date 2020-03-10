import * as Yup from 'yup';

import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    /**
     * Valida destinatário
     */
    const recipientExists = await Recipient.findByPk(recipient_id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient not exists' });
    }

    /**
     * Valida entregador
     */
    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman not exists' });
    }

    const { id, product } = await Order.create(req.body);

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  async index(req, res) {
    const orders = await Order.findAll({
      order: [['created_at', 'DESC']],
      attributes: [
        'id',
        'product',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'canceled_at',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email', 'avatar_id'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(orders);
  }

  async show(req, res) {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      attributes: [
        'id',
        'product',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'canceled_at',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email', 'avatar_id'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().notOneOf([null, '']),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { id } = req.params;
    const { deliveryman_id } = req.body;

    /**
     * Valida encomenda
     */
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(400).json({ error: 'Order not exists' });
    }

    /**
     * Valida canceled_at
     */
    if (order.canceled_at !== null) {
      return res
        .status(401)
        .json({ error: 'Order already canceled, cannot be updated' });
    }

    /**
     * Valida start_date
     */
    if (order.start_date !== null) {
      return res
        .status(401)
        .json({ error: 'Order is out for delivery, cannot be updated' });
    }

    /**
     * Valida end_date
     */
    if (order.end_date !== null) {
      return res
        .status(401)
        .json({ error: 'Order already completed, cannot be updated' });
    }

    /**
     * Valida entregador
     */
    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman not exists' });
    }

    await order.update(req.body);

    const { product, recipient, deliveryman } = await Order.findByPk(id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email', 'avatar_id'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json({
      id,
      product,
      deliveryman,
      recipient,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    /**
     * Valida encomenda
     */
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    /**
     * Valida canceled_at
     */
    if (order.canceled_at !== null) {
      return res.status(401).json({ error: 'Order already canceled' });
    }

    /**
     * Valida end_date
     */
    if (order.end_date !== null) {
      return res
        .status(401)
        .json({ error: 'Order already completed, cannot be canceled' });
    }

    order.canceled_at = new Date();

    await order.save();

    const {
      canceled_at,
      product,
      recipient,
      deliveryman,
    } = await Order.findByPk(id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email', 'avatar_id'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json({
      id,
      canceled_at,
      product,
      deliveryman,
      recipient,
    });
  }
}

export default new OrderController();
