
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const protect = async (req, res, next) => {
 
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
  
      return res.status(401).json({ message: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {


      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
   
    next();
  } catch (err) {
   
    if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ message: "Not authorized or token is invalid." });
    }
    return res.status(401).json({ message: "Not authorized", error: err.message });
  } finally {
   
  }
};

module.exports = protect;
