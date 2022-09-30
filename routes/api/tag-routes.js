const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  try {
    const data = await Tag.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one Tag by its `id` value
  try {
    const data = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new Tag
  try {
    const data = await Tag.create(req.body)
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a Tag by its `id` value
  try {
    const data = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (!data[0]) {
      res.status(400).json({ message: 'no user with this id'});
      return;
    }
    res.status(200).json({ message: 'record updated'});
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a Tag by its `id` value
  try {
    const data = await Tag.destroy({
      where: {
        
        id: parseInt(req.params.id),
      },
    });
    if (!data) {
      res.status(400).json({ message: 'no user with this id'});
      return;
    }
    res.status(200).json({ message: 'record deleted'});
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
