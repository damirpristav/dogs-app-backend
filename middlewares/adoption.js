const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');
const Adoption = require('../models/Adoption');
const Dog = require('../models/Dog');

exports.isAvailable = handleAsync(async (req, res, next) => {
  const dog = await Dog.findById(req.params.dogId);
  if(!dog) {
    return next(new AppError('Dog with this id does not exist', 404));
  }

  const dogAdoption = await Adoption.findOne({ dog: dog._id });
  if(dogAdoption && dog.adoption !== 'none') {
    return next(new AppError('This dog cannot be adopted because adoption is already in progress or is already adopted.', 400));
  }

  dog.active = false;
  dog.adoption = 'in progress';
  await dog.save({ validateBeforeSave: false });

  req.dog = dog;
  next();
});