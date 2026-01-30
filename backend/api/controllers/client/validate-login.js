const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

  friendlyName: 'Validate login',

  description: 'Login user using username or email and password',

  inputs: {
    username: { type: 'string', required: false },
    email: { type: 'string', required: false },
    password: { type: 'string', required: true }
  },

  exits: {
    success: { statusCode: 200 },
    badRequest: { statusCode: 400 },
    unauthorized: { statusCode: 401 },
    serverError: { statusCode: 500 }
  },

  fn: async function (inputs, exits) {
    const res = this.res;

    try {
      const loginIdentifier = (inputs.username || inputs.email || '').trim();

      if (!loginIdentifier || !inputs.password) {
        return res.json({
          record: {
            status: 'error',
            status_code: 203,
            message: 'Username/email and password are required'
          }
        });
      }

      // 🔍 Find client
      const user = await Client.findOne({
        where: {
          or: [
            { username: loginIdentifier },
            { emailAddress: loginIdentifier }
          ],
          isDeleted: 0,
          isDisabled: 0
        }
      }).populate('billingAccount');

      if (!user) {
        await HistoricalEvent.create({
          description: 'Username/email not found',
          actorId: 0,
          actorType: 'Other',
          actorDisplayName: loginIdentifier,
          category: 'Login'
        });

        return res.json({
          record: {
            status: 'error',
            status_code: 202,
            message: 'Username or email not found'
          }
        });
      }

      // 🔐 Password check
      const isMatch = await bcrypt.compare(inputs.password, user.password);
      if (!isMatch) {
        await HistoricalEvent.create({
          description: 'Invalid login password',
          actorId: user.id,
          actorType: 'Client',
          actorDisplayName: user.fullName,
          category: 'Login'
        });

        return res.json({
          record: {
            status: 'error',
            status_code: 202,
            message: 'Invalid password'
          }
        });
      }

      // 🔑 JWT
      const token = jwt.sign(
        { id: user.id, type: 'client' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // 🍪 Cookie (optional – same as old)
      res.cookie('jwt', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      // 📝 Update login info
      await Client.updateOne({ id: user.id }).set({
        token,
        lastSeenAt: Date.now()
      });

      // 🧾 Login success log
      await HistoricalEvent.create({
        description: 'Login successful',
        actorId: user.id,
        actorType: 'Client',
        actorDisplayName: user.fullName,
        category: 'Login'
      });

      if (user.billingAccount) {
        user.bookkeepingId = user.billingAccount.bookkeepingId;
      }

      delete user.password;

      return res.json({
        record: {
          status: 'success',
          status_code: 200,
          message: 'Login successful',
          data: user,
          token
        }
      });

    } catch (err) {
      sails.log.error('Login error:', err);

      await ErrorEvent.create({
        description: (err.message || 'Login error').substring(0, 255),
        actorId: 0,
        actorType: 'System',
        actorDisplayName: 'validate-login',
        category: 'Error'
      });

      return res.json({
        record: {
          status: 'error',
          status_code: 500,
          message: 'Internal Server Error'
        }
      });
    }
  }
};
