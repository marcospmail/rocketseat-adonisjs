'use strict'

const moment = require('moment')
const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgot_password'],
        { email, token: user.token, link: `${request.input('redirect_url')}?token=${user.token}` },
        message => {
          message.to(user.email)
            .from('marcosp.mail@gmail.com', 'Marcos')
            .subject('Password recovery')
        }
      )
    } catch (err) {
      return response.status(err.status).send({ error: { message: 'Something didnt work, is this a valid email?' } })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password } = request.all()

      const user = await User.findByOrFail('token', token)

      const tokenExpired = moment()
        .subtract('2', 'days')
        .isAfter(user.token_created_at)

      if (tokenExpired) {
        return response
          .status(401)
          .send({ error: { message: 'Expired token' } })
      }

      user.token = null
      user.token_created_at = null
      user.password = password

      user.save()
    } catch (err) {
      console.log(err)
      return response
        .status(401)
        .send({ error: { message: 'Something didnt work' } })
    }
  }
}

module.exports = ForgotPasswordController
