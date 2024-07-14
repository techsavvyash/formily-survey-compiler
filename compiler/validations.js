const VALIDATION_TYPES = {
    URL: "url",
    EMAIL: "email",
    DATE: "date",
    NUMBER: "number",
};

const ValidationREGEX = {
    "url": /^(http|https):\/\/[^ "]+$/,
    "email": /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "date": /^\d{4}-\d{2}-\d{2}$/,
    "number": /^\d+$/,
}

module.exports = {
    VALIDATION_TYPES,
    ValidationREGEX,
};