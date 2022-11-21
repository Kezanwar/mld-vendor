const mongoose = require('mongoose')

const StoreSchema = mongoose.Schema(
  {
    store_name: {
      type: String,
      unique: true,
      // required: true,
      // validate: {
      //   validator: function (v) {
      //     return v.length > 1
      //   },
      //   message: (props) => {
      //     return `length should be greater than 1`
      //   },
      // },
    },
    store_url: {
      type: String,
      // required: true,
      unique: true,
      // validate: {
      //   validator: function (v) {
      //     return v.length > 3
      //   },
      //   message: (props) => {
      //     console.log(props)
      //     return `length should be greater than 3`
      //   },
      // },
    },
    bio: {
      type: String,
    },
    profile_image: {
      type: String,
    },
    cover_photo: {
      type: String,
    },
    company_info: {
      type: Object,
      // select: false,
      company_name: {
        type: String,
      },
      company_number: {
        type: String,
        unique: true,
      },
      company_address: {
        type: Object,
        // select: false,
        address_line_1: {
          type: String,
        },
        address_line_2: {
          type: String,
        },
        postcode: {
          type: String,
        },
        city: {
          type: String,
        },
      },
    },
    store_address: {
      type: Object,
      address_line_1: {
        type: String,
      },
      address_line_2: {
        type: String,
      },
      postcode: {
        type: String,
      },
      city: {
        type: String,
      },
    },
    contact_details: {
      // select: false,
      email: {
        type: String,
      },
      contact_number: {
        type: String,
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
      select: false,
    },
    notifications: [
      {
        type: {
          type: String,
          // required: true,
        },
        author: {
          type: String,
          // required: true,
        },
        link: {
          type: String,
          // required: true,
        },
        date: {
          type: Date,
          default: Date,
        },
      },
    ],
    registration_step: {
      type: String,
      required: true,
    },
    store_status: {
      type: String,
      required: true,
    },
    super_admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      select: false,
    },
  },
  { timestamps: true }
)

// setup methods

// NEW STORE IS HANDLED

// NEW STEP 1
StoreSchema.methods.setupStep1New = async function (data) {
  this.company_info = data
  await this.save()
}

// UPDATE STEP 1
StoreSchema.methods.setupStep1Update = async function (data) {
  if (!data) throw new Error('no data passed to setup method')
  const dataArr = Object.entries(data)
  dataArr.forEach((entry) => {
    this[entry[0]] = entry[1]
  })
  await this.save()
}

// STEP 2
StoreSchema.methods.setupStep2 = async function ({
  store_name,
  store_url,
  bio,
  email,
  contact_number,
  profile_image,
  cover_photo,
}) {
  this.store_name = store_name
  this.store_url = store_url
  this.bio = bio
  this.contact_details = {
    email,
    contact_number,
  }
  if (profile_image) {
    this.profile_image = profile_image
  }
  if (cover_photo) {
    this.cover_photo = cover_photo
  }
  await this.save()
}

module.exports = Store = mongoose.model('store', StoreSchema)
