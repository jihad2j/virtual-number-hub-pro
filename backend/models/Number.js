
/**
 * This file re-exports the PhoneNumber model for backward compatibility.
 * It provides a consistent interface for code that imports the Number model.
 */

const PhoneNumber = require('./PhoneNumber');

// Re-export the PhoneNumber model as Number
module.exports = PhoneNumber;
