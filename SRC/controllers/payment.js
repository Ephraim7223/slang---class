import Paystack from 'paystack';
import User from '../models/user.model.js';
import cron from 'node-cron';
import { paymentSuccessfulTemplate } from '../templates/paymentSuccessfulTemplate.js';
import { blueTickExpiryTemplate } from '../templates/blueTickExpiryTemplate.js';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

export const payForBlueTick = async (req, res) => {
    const userId = req.user._id;
    const email = req.user.email;
    const amount = req.body.amount;

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
      await user.save();
      await paymentSuccessfulTemplate(user.email, user.userName);

      cron.schedule('0 0 0 1 1 *', async () => {
        user.isPaid = false;
        await user.save();
        await blueTickExpiryTemplate(user.email, user.userName);
      }, {
        scheduled: true,
        timezone: "UTC"
      });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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
            await blueTickExpiryTemplate(currentUser.email, currentUser.userName);
          }
        }, {
          scheduled: true,
          timezone: "UTC"
        });
      } else {
        res.status(400).json({ message: 'Payment verification failed, Your mind go deh' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };