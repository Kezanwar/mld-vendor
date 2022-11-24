const express = require('express')
const router = express.Router()
const util = require('../utilities/utilities')

// models

const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')

// middlewares
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

// route POST api/post
// @desc Create a post
// @access private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json(errors)

    try {
      const user = await User.findById(req.user.id).select('-password')
      const profile = await Profile.find({ user: req.user.id }).select(
        'username'
      )
      let username = user.name
      if (!util.ArrayIsEmpty(profile) && profile[0].username !== '')
        username = profile[0].username

      const newPost = {
        text: req.body.text,
        name: username,
        avatar: user.avatar,
        user: req.user.id,
      }

      const post = Post(newPost)
      await post.save()

      res.json(post)
    } catch (error) {
      console.error(error)
      res.status(500).json({ msg: 'server error' })
    }
  }
)

// route GET api/post
// @desc Get all posts
// @access private

router.get('/', async (req, res) => {
  // console.log(req)
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'server error' })
  }
})

// route GET api/post
// @desc Get a post by post ID
// @access private

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ msg: 'post not found' })
    }
    res.json(post)
  } catch (error) {
    console.error(error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' })
    }
    res.status(500).json({ msg: 'server error' })
  }
})

// route DELETE api/post
// @desc delete a post by post ID
// @access private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'post not found' })

    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'user not authorized' })

    await post.remove()
    res.json({ msg: 'post removed' })

    res.json(post)
  } catch (error) {
    console.error(error)
    if (error.kind === 'ObjectId')
      return res.status(404).json({ msg: 'post not found' })
    res.status(500).json({ msg: 'server error' })
  }
})

// route GET api/post
// @desc Get all posts by user ID
// @access private

router.get('/user/:userid', async (req, res) => {
  try {
    const posts = await Post.find().where({ user: req.params.userid })
    if (util.ArrayIsEmpty(posts)) {
      return res.status(404).json({ msg: 'posts not found' })
    }
    res.json(posts)
  } catch (error) {
    console.error(error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'posts not found' })
    }
    res.status(500).json({ msg: 'server error' })
  }
})

// route PUT api/post/like/:id
// @desc Like a post
// @access private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'post not found' })

    const likesByUser = post.likes.filter(
      (like) => like.user.toString() === req.user.id
    )
    if (likesByUser.length > 0)
      return res.status(400).json({ msg: 'post already liked' })

    post.likes.unshift({ user: req.user.id })
    await post.save()

    res.json(post.likes)
  } catch (error) {
    console.error(error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'posts not found' })
    }
    res.status(500).json({ msg: 'server error' })
  }
})

// route PUT api/post/like/:id
// @desc Like a post
// @access private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ msg: 'post not found' })

    const likesByUser = post.likes.filter(
      (like) => like.user.toString() === req.user.id
    )
    if (likesByUser.length < 1)
      return res.status(400).json({ msg: "post hasn't been liked yet" })

    // remove index

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id)
    post.likes.splice(removeIndex, 1)

    await post.save()

    res.json(post.likes)
  } catch (error) {
    console.error(error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'posts not found' })
    }
    res.status(500).json({ msg: 'server error' })
  }
})

// route POST api/posts/comment:id
// @desc Comment on a post using posts id
// @access private

router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json(errors)

    try {
      const user = await User.findById(req.user.id).select('-password')
      const profile = await Profile.find({ user: req.user.id }).select(
        'username'
      )
      let username = user.name
      if (!util.ArrayIsEmpty(profile) && profile[0].username !== '')
        username = profile[0].username

      const post = await Post.findById(req.params.id)
      const newComment = {
        text: req.body.text,
        name: username,
        avatar: user.avatar,
        user: req.user.id,
      }

      post.comments.unshift(newComment)
      await post.save()
      res.json(post.comments)
    } catch (error) {
      console.error(error)
      res.status(500).json({ msg: 'server error' })
    }
  }
)

// route DELETE api/posts/comment:id
// @desc Delete posts id
// @access private

router.delete('/comment/:postid/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid)
    if (!post) return res.status(404).json({ msg: 'post not found' })

    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    )
    if (!comment) return res.status(404).json({ msg: 'comment not found' })
    if (comment.user.toString() !== req.user.id)
      return res.status(404).json({ msg: 'user not authorized' })

    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id)
    post.comments.splice(removeIndex, 1)

    await post.save()

    res.json(post.comments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'server error' })
  }
})

module.exports = router
