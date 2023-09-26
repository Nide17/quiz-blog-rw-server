const express = require("express")
const router = express.Router()
const { sendEmail } = require("./emails/sendEmail")

// auth middleware to protect routes
const { auth, authRole } = require('../../middleware/auth')

//Contact Model : use capital letters since it's a model
const Contact = require('../../models/Contact')
const User = require('../../models/User')

// @route GET api/contacts
// @route Get All contacts
// @route Private: accessed by authorization
router.get('/', auth, async (req, res) => {

  // Pagination
  const totalPages = await Contact.countDocuments({})
  var PAGE_SIZE = 10
  var pageNo = parseInt(req.query.pageNo || "0")
  var query = {}

  query.limit = PAGE_SIZE
  query.skip = PAGE_SIZE * (pageNo - 1)

  try {

    const contacts = pageNo > 0 ?
      await Contact.find({}, {}, query)
        .sort({ contact_date: -1 }) :

      await Contact.find()
        //sort contacts by contact_date
        .sort({ contact_date: -1 })

    if (!contacts) throw Error('No contacts exist')

    if (pageNo > 0) {

      return res.status(200).json({
        totalPages: Math.ceil(totalPages / PAGE_SIZE),
        contacts
      })
    }
    else {
      return res.status(200).json(contacts)
    }

  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
})

// @route   GET /api/contacts/sent-by/:userEmail
// @desc    Get all contacts by user
// @access  Private: accessed by authenticated users
router.get('/sent-by/:userEmail', auth, async (req, res) => {

  let userEmail = req.params.userEmail
  try {
    //Find the contacts by userEmail
    const contacts = await Contact.find({ email: userEmail }).sort({ contact_date: -1 })
    
    if (!contacts) throw Error('No contacts found')

    res.status(200).json(contacts)

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to retrieve! ' + err.message
    })
  }

})

// @route POST api/contacts
// @route Create a Contact
// @route Public
router.post("/", async (req, res) => {
  try {
    const newContact = await Contact.create(req.body)

    if (!newContact) throw Error('Something went wrong!')

    // Sending e-mail to contacted user
    sendEmail(
      newContact.email,
      "Thank you for contacting Quiz-Blog!",
      {
        name: newContact.contact_name,
      },
      "./template/contact.handlebars")


    // Sending e-mail to super admins and admins
    const admins = await User.find({ role: { $in: ["Admin", "SuperAdmin"] } }).select("email")

    admins.forEach(adm => {
      sendEmail(
        adm.email,
        "A new message, someone contacted us!",
        {
          cEmail: newContact.email
        },
        "./template/contactAdmin.handlebars")
    })

    res.status(200).json(newContact)

  } catch (err) {
    console.log(err)

    if (err.name === "ValidationError") {
      return res.status(400).send(err.errors)
    }
    res.status(500).send("Something went wrong")
  }
})

// @route GET api/contacts/:id
// @route GET one Contact
// @route Private: accessed by authorization
router.get('/:id', auth, (req, res) => {

  //Find the Contact by id
  Contact.findById(req.params.id)

    //return a promise
    .then(contact => res.json(contact))
    // if id not exist or if error
    .catch(err => res.status(404).json({ success: false }))
})

// @route PUT api/contacts/:id
// @route Replying a contact
// @access Private: accessed by the authenticated user
router.put('/:id', auth, async (req, res) => {

  try {

    // Update the Quiz on Contact updating
    const contact = await Contact.updateOne(
      { "_id": req.params.id },
      { $push: { "replies": req.body } },
      { new: true }
    )

    console.log(req.body.to_contact)
    console.log(req.body)

    // Send Reply email
    sendEmail(
      req.body.to_contact,
      "New reply",
      {
        name: req.body.to_contact_name,
        question: req.body.contact_question,
        answer: req.body.message,
      },
      "./template/reply.handlebars")

    res.status(200).json(contact)

  } catch (err) {
    res.status(400).json({
      msg: 'Failed to update! ' + err.message,
      success: false
    })
  }
})

// @route DELETE api/contacts
// @route delete a Contact
// @route Private: Accessed by authorization
router.delete('/:id', authRole(['Admin', 'SuperAdmin']), (req, res) => {

  //Find the Contact to delete by id first
  Contact.findById(req.params.id)

    //returns promise 
    .then(contact => contact.remove().then(() => res.json({ success: true })))
    // if id not exist or if error
    .catch(err => res.status(404).json({ success: false }))
})

module.exports = router