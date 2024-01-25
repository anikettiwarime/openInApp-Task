import Twilio from 'twilio';
import {ApiError} from './ApiError.js';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new Twilio(accountSid, authToken);

const makeOutGoingCall = async (to, message) => {
    try {
        console.log('Making call');
        const call = await client.calls.create({
            twiml: `<Response><Say>${message}</Say></Response>`,
            to,
            from: twilioNumber,
        });
        console.log('Call made successfully', call);
        return call;
    } catch (error) {
        console.error('Error making call', error);
        throw new ApiError(500, 'Error making call');
    }
};

export {makeOutGoingCall};
