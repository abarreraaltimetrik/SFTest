const FILL_REQUIRED_FIELDS = 'Please fill in all required fields.';
const ONLY_LETTERS_AND_SPACES_REGEX = /^[a-zA-Z\s]*$/;
const ONLY_NUMBERS_REGEX = /^\d{10}$/;
const COMPLETED_STATUS = 'COMPLETED';
const FAILED_STATUS = 'FAILED';
const QUEUED_STATUS = 'QUEUED';

const ERROR_MESSAGES = {
  firstName: 'Please enter a valid first name (letters and spaces only).',
  lastName: 'Please enter a valid last name (letters and spaces only).',
  npi: 'Please enter a valid NPI (10 numbers only).',
};

const REQUEST_ERROR_TITLE = 'Verification license request could not be completed';
const UNEXPECTED_REQUEST_ERROR_TITLE = 'An unexpected error occurred.';
const UNEXPECTED_REQUEST_ERROR_MESSSAGE = 'Please try again shortly.';

export {
  FILL_REQUIRED_FIELDS,
  ONLY_LETTERS_AND_SPACES_REGEX,
  ONLY_NUMBERS_REGEX,
  ERROR_MESSAGES,
  COMPLETED_STATUS,
  FAILED_STATUS,
  QUEUED_STATUS,
  REQUEST_ERROR_TITLE,
  UNEXPECTED_REQUEST_ERROR_TITLE,
  UNEXPECTED_REQUEST_ERROR_MESSSAGE,
};