const express = require("express");
const router = express.Router();
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage })

const { isLoggedIn, isAdmin } = require('../middleware')
const recipeControlers = require('../controlers/recipes')

router.route('/').get(recipeControlers.renderSearchRecipes)
router.route('/add')
    .get(isAdmin, recipeControlers.renderAddRecipe)
    .post(isAdmin, upload.single('recipe-image'), recipeControlers.createRecipe)
router.route('/:id')
    .get(recipeControlers.renderRecipeShow)
    .delete(isAdmin, recipeControlers.deleteRecepie)
    .put(isAdmin, recipeControlers.editRecipe)
router.route('/:id/edit')
    .get(isAdmin, recipeControlers.renderEditRecipe)


module.exports = router