const jwt = require('jsonwebtoken');
const User = require('../models/userSchema'); // Assuming your user model is here
const { ErrorHandler } = require('../error/error');

exports.isAuthenticated = async (req, res, next) => {
    try {
        let jwtToken = req.header('Authorization'); 

        if (jwtToken && jwtToken.startsWith('Bearer ')) {
            jwtToken = jwtToken.replace('Bearer ', '');
        } else {
        
            const { token } = req.cookies;
            if (token) {
                jwtToken = token;
            }
        }



        if (!jwtToken) {
            
            return next(new ErrorHandler("No token provided", 401));
        }

     
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET); 

 

   
        req.user = await User.findById(decoded.id);

        if (!req.user) {
       
            return next(new ErrorHandler("User not found", 401));
        }

       


        next(); 
    } catch (error) {
        console.error("DEBUG: isAuthenticated middleware - Error during authentication:", error.message);
        if (error.name === 'JsonWebTokenError') {
            return next(new ErrorHandler("Invalid Token", 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler("Token Expired", 401));
        }
        return next(new ErrorHandler("Authentication Failed", 500));
    }
};
