const mongoose = require('mongoose')

const UserSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 1
        },
        message: (props) => {
          console.log(props)
          return `length should be greater than 1`
        },
      },
    },
    last_name: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 1
        },
        message: (props) => {
          console.log(props)
          return `length should be greater than 1`
        },
      },
    },
    display_name: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 1
        },
        message: (props) => {
          console.log(props)
          return `length should be greater than 1`
        },
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    email_confirmed: {
      type: Boolean,
      default: false,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    dob: Date,
    interests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tag',
      },
    ],
    favourite_products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
      },
    ],
    favourite_stores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'store',
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'review',
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
      },
    ],
    store: {
      store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'store',
      },
      role: {
        type: String,
        // required: function () {
        //   return !!this.store.id
        // },
      },
    },

    payment_details: {
      type: Object,
      // need to add to this
      select: false,
    },
    notifications: [
      {
        type: {
          type: String,
          required: true,
        },
        author: {
          type: String,
          required: true,
        },
        link: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date,
        },
      },
    ],
  },
  { timestamps: true }
)

module.exports = User = mongoose.model('user', UserSchema)
