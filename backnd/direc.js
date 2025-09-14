// generatePaymentRequest.js
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Function to generate JWT for payment gateway
function generatePaymentJWT(payload, secretKey) {
  return jwt.sign(payload, secretKey, { algorithm: 'HS256' });
}

// Main function to create payment request
async function createPaymentRequest(school_id, amount, callback_url, pgApiKey, pgSecretKey) {
  try {
    // Create JWT payload
    const jwtPayload = {
      school_id: school_id.toString(),
      amount: amount.toString(),
      callback_url
    };
    
    // Generate signed JWT
    const sign = generatePaymentJWT(jwtPayload, pgApiKey);

    // Prepare request to payment gateway
    const paymentRequest = {
      school_id: school_id.toString(),
      amount: amount.toString(),
      callback_url,
      sign
    };

    // Call payment gateway API
    const response = await axios.post(
      'https://dev-vanilla.edviron.com/erp/create-collect-request',
      paymentRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pgSecretKey}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating payment request:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

async function checkPaymentStatus(collect_request_id, school_id, pgApiKey, pgSecretKey) {
    try {
      // Create JWT payload for status check
      const jwtPayload = {
        school_id: school_id.toString(),
        collect_request_id: collect_request_id.toString()
      };
      
      // Generate signed JWT
      const sign = generatePaymentJWT(jwtPayload, pgApiKey);
  
      // Call payment gateway status API
      const response = await axios.get(
        `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}`,
        {
          params: {
            school_id: school_id.toString(),
            sign
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pgSecretKey}`
          }
        }
      );
  
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  }
  
// Main function to handle complete payment flow
async function handlePaymentFlow(school_id, amount, callback_url, pgApiKey, pgSecretKey) {
  try {
    console.log('Creating payment request...');
    
    // Step 1: Create payment request
    const paymentResponse = await createPaymentRequest(
      school_id, 
      amount, 
      callback_url, 
      pgApiKey, 
      pgSecretKey
    );
    
    console.log('Payment request successful:');
    console.log('Collect Request ID:', paymentResponse.collect_request_id);
    console.log('Payment URL:', paymentResponse.Collect_request_url);
    console.log('JWT Sign:', paymentResponse.sign);
    
    // Step 2: Check payment status (usually you'd do this after some time or via webhook)
    console.log('\nChecking payment status...');
    
    const statusResponse = await checkPaymentStatus(
      paymentResponse.collect_request_id,
      school_id,
      pgApiKey,
      pgSecretKey
    );
    
    console.log('Payment status:', statusResponse.status);
    console.log('Amount:', statusResponse.amount);
    console.log('Details:', statusResponse.details);
    
    return {
      paymentRequest: paymentResponse,
      paymentStatus: statusResponse
    };
    
  } catch (error) {
    console.error('Failed in payment flow:', error.message);
    throw error;
  }
}

// Example usage
async function main() {
  // Replace these with your actual values
  const school_id = "65b0e6293e9f76a9694d84b4";
  const amount = 1; // Amount in INR
  const callback_url = "https://ff54974973d9.ngrok-free.app/hea";
  const pgApiKey = process.env.PG_API_KEY || "edvtest01";
  const pgSecretKey = process.env.PG_SECRET_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0";

  try {
    const result = await handlePaymentFlow(school_id, amount, callback_url, pgApiKey, pgSecretKey);
    return result;
  } catch (error) {
    console.error('Failed to complete payment flow:', error.message);
  }
}

// Export the functions for use in other modules
module.exports = { 
  createPaymentRequest, 
  checkPaymentStatus, 
  handlePaymentFlow,
  generatePaymentJWT 
};

// If this file is run directly, execute the example
if (require.main === module) {
  main();
}  