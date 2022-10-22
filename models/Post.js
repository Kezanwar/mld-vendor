// const mongoose = require('mongoose');

// const PostSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'user'
//     },
//     text: {
//         type: String,
//         required: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     avatar: {
//         type: String,
//         required: true
//     },
//     date: {
//         type: Date,
//         default: Date()
//     },
//     likes: [
//         {
//             user: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'user'
//             }
//         }
//     ],
//     comments: [
//         {
//             user: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'user'
//             },
//             text: {
//                 type: String
//             },
//             name: {
//                 type: String
//             },
//             avatar: {
//                 type: String
//             },
//             date: {
//                 type: Date,
//                 default: Date()
//             }
//         }
//     ]
// })

// module.exports = Post = mongoose.model('post', PostSchema)
