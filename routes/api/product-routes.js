const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

router.get('/', async (req, res) => {
  // find all products
  try {
    const data = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one Product by its `id` value
  try {
    const data = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const data = await Product.create(req.body);
    let productTagIdArray = [];
    //if there's product tags, create pairings to bulk create in the ProductTag model
    if (req.body.tagIds.length) {
      productTagIdArray = req.body.tagIds.map((tag_id) => {
        return {
          productId: data.id,
          tagId: tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArray);
    }
    // respond posted data and aded product-tag id
    res.status(200).json({data, productTagIdArray});
  } catch (err) {
    res.status(400).json(err);
  }
})


// update product
router.put('/:id', async (req, res) => {
  try {
    // update product data
    const data = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (!data[0]) {
      res.status(400).json({ message: 'no user with this id'});
      return;
    };
    // find all associated tags from ProductTag
    const associatedTags =  await ProductTag.findAll({ where: { productId: req.params.id } });
    // get list of current tag_ids
    const productTagIds = associatedTags.map(({ tagId }) => tagId);
    // create filtered list of new tag_ids
    const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          productId: req.params.id,
          tagId: tag_id,
        };
      });
    // figure out which ones to remove
    const productTagsToRemove = associatedTags
      .filter(({ tagId }) => !req.body.tagIds.includes(tagId))
      .map(({ id }) => id);

    // run both actions
    ProductTag.destroy({ where: { id: productTagsToRemove } }),
    ProductTag.bulkCreate(newProductTags),
    res.status(200).json({ message: 'record updated'});

  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const data = await Product.destroy({
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
