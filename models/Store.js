const mongoose = require('mongoose')

const StoreSchema = mongoose.Schema(
  {
    store_name: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 1
        },
        message: (props) => {
          return `length should be greater than 1`
        },
      },
    },
    store_url: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 3
        },
        message: (props) => {
          console.log(props)
          return `length should be greater than 3`
        },
      },
    },
    company_info: {
      registered_company_name: {
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
      registered_company_number: {
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
      registered_office_address: {
        address_line_1: {
          type: String,
          required: true,
        },
        address_line_2: {
          type: String,
          required: true,
        },
        postcode: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
      },
    },
    store_address: {
      address_line_1: {
        type: String,
        required: true,
      },
      address_line_2: {
        type: String,
        required: true,
      },
      postcode: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
    },
    contact_details: {
      email: {
        type: String,
        required: true,
        unique: true,
      },
      telephone_number: {
        type: String,
        required: true,
        unique: true,
      },
    },
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

    payment_details: {
      type: Object,
      // need to add to this
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
    application_status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = Store = mongoose.model('store', StoreSchema)
