  const mongoose = require('mongoose');
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');

  const userSchema = new mongoose.Schema(
    {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },


   
  lastName: {
  type: String,
  trim: true,
},

      username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

   phone: {
  type: String,
  trim: true,
},
      password: {
        type: String,
        required: true,
        minlength: 6,
      },

      isAdmin: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  );




  userSchema.pre('save', async function () { 
    const user = this;

    if (!user.isModified('password')) {
      return; 
    }

    const saltRound = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, saltRound);
  });




  userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };




  userSchema.methods.generateToken = function () {
    return jwt.sign(
      {
        userId: this._id.toString(),
        email: this.email,
        isAdmin: this.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
      }
    );
  };



  const User = mongoose.model('User', userSchema);

  module.exports = User;