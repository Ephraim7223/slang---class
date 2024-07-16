import Paystack from 'paystack';
import User from '../models/user.model.js';
import cron from 'node-cron';
import { paymentSuccessfulTemplate } from '../templates/paymentSuccessfulTemplate.js';
import { tickExpiryTemplate } from '../templates/TickExpiryTemplate.js';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

export const payForTick = async (req, res) => {
  const userId = req.user._id;
  const email = req.user.email;
  const amount = req.body.amount;
  const tickType = req.body.tickType;
  const duration = tickType === 'blue' ? 12 : tickType === 'yellow' ? 6 : 1;

  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const paymentResponse = await paystack.transaction.initialize({
          email: email,
          amount: amount * 100,
          callback_url: `${process.env.CALLBACK_URL}/verify-payment`
      });

      res.status(200).json({ authorization_url: paymentResponse.data.authorization_url });

      const paymentSuccessful = true;


      if (paymentSuccessful) {
        user.isPaid = true;
        user[`${tickType}TickExpiresAt`] = new Date(new Date().setMonth(new Date().getMonth() + duration));
        await user.save();
        await paymentSuccessfulTemplate(user.email, user.userName, tickType, user[`${tickType}TickExpiresAt`]);

        cron.schedule('0 0 0 * * *', async () => {
            const currentUser = await User.findById(user._id);
            if (currentUser[`${tickType}TickExpiresAt`] <= new Date()) {
                currentUser.isPaid = false;
                currentUser[`${tickType}TickExpiresAt`] = null;
                await currentUser.save();
                await tickExpiryTemplate(currentUser.email, currentUser.userName, tickType);
            }
        }, {
            scheduled: true,
            timezone: "UTC"
        });
    }

  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const payForBlueTick = (req, res) => payForTick(req, res, 'blue', 12);
export const payForYellowTick = (req, res) => payForTick(req, res, 'yellow', 6);
export const payForGreenTick = (req, res) => payForTick(req, res, 'green', 1);

export const verifyPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const verificationResponse = await paystack.transaction.verify(reference);

    if (verificationResponse.data.status === 'success') {
      const user = await User.findById(verificationResponse.data.metadata.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isPaid = true;
      user.blueTickExpiresAt = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
      await user.save();

      await paymentSuccessfulTemplate(user.email, user.userName);

      res.status(200).json({ message: 'Payment successful', user });

      cron.schedule('0 0 0 * * *', async () => {
        const currentUser = await User.findById(user._id);
        if (currentUser.blueTickExpiresAt <= new Date()) {
          currentUser.isPaid = false;
          currentUser.blueTickExpiresAt = null;
          await currentUser.save();
          await tickExpiryTemplate(currentUser.email, currentUser.userName, 'blue');
        }
      }, {
        scheduled: true,
        timezone: "UTC"
      });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
