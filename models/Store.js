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
        country: {
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
      country: {
        type: String,
      },
    },
    store_address_use_company: {
      type: Boolean,
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
StoreSchema.methods.updateStoreAddress = async function ({
  store_address_use_company,
  store_address,
}) {
  console.log(this)
  if (store_address_use_company === true) {
    this.store_address.address_line_1 =
      this.company_info.company_address.address_line_1
    this.store_address.address_line_2 =
      this.company_info.company_address.address_line_2 || ''
    this.store_address.postcode = this.company_info.company_address.postcode
    this.store_address.city = this.company_info.company_address.city
    this.store_address.country = this.company_info.company_address.country
    this.store_address_use_company = store_address_use_company
    await this.save()
    return
  }
  if (store_address_use_company === false) {
    if (
      !store_address?.address_line_1 ||
      !store_address?.postcode ||
      !store_address?.city ||
      !store_address?.country
    ) {
      throw new Error('Store address incomplete')
    } else {
      this.store_address = store_address
      this.store_address_use_company = store_address_use_company
      await this.save()
    }
  }
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
  store_address,
}) {
  this.store_name = store_name
  this.store_url = store_url
  this.bio = bio
  this.store_address = store_address
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
  if (this.registration_step === '1') {
    this.registration_step = '2'
  }
  await this.save()
}

module.exports = Store = mongoose.model('store', StoreSchema)
