// routes/dishRoute.js
const express = require('express');
const router = express.Router();

// A simple in-memory data store for dish suggestions with fancy text
const dishSuggestions = {
    happy: "You're happy! What better way to celebrate than with a flavorful and aromatic Veg Biryani? It's a true feast for the senses!",
    sad: "Feeling down? A warm bowl of Tomato Soup is the perfect comfort food to cheer you up.",
    angry: "Feeling a little hot-headed? A cool, creamy, and soothing glass of Mango Lassi is just what you need to calm your spirit.",
    hungry: "You're hungry! I'd recommend a rich, sweet, and melt-in-your-mouth Gulab Jamun to satisfy your cravings.",
};

// Route to get a dish suggestion based on mood
router.get('/suggest', (req, res) => {
    const { mood } = req.query; // Get the 'mood' from the query parameters

    // Check if the mood is supported
    if (!mood || !dishSuggestions[mood]) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing mood parameter. Please provide a valid mood (e.g., happy, sad, angry, hungry).'
        });
    }

    const dishSuggestionText = dishSuggestions[mood];
    res.status(200).json({
        success: true,
        dish: dishSuggestionText // Now returning the full sentence
    });
});

module.exports = router;