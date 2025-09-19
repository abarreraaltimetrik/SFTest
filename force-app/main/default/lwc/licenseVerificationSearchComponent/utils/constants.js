const COMPLETED_STATUS = 'COMPLETED';
const FAILED_STATUS = 'FAILED';
const QUEUED_STATUS = 'QUEUED';
const FILL_REQUIRED_FIELDS = 'Please fill in all required fields.';
const FIELD_NOT_PROVIDED = 'Not provided';
const ONLY_LETTERS_AND_SPACES_REGEX = /^[a-zA-Z\s]*$/;
const ONLY_LETTERS_REGEX = /^[a-zA-Z]*$/;
const ONLY_NUMBERS_REGEX = /^\d*$/;
const SSN_REGEX = /^\d{3}-\d{2}-\d{4}$/;
const STATE_CODE_REGEX = /^[A-Z]{2,4}$/;
const CERT_STATE_REGEX = /^[A-Z]{2}$/;
const ZIP_CODE_REGEX = /^\d{5}$/;
const ERROR_MESSAGES = {
  firstName: 'Please enter a valid first name (letters and spaces only).',
  lastName: 'Please enter a valid last name (letters and spaces only).',
  middleName: 'Please enter a valid middle name (letters and spaces only).',
  zipCode: 'Please enter a valid zip code (format: XXXXX).',
  socialSecurityNumber: 'Please enter a valid SSN (format: XXX-XX-XXXX).',
  stateCode: 'Please enter a valid state code (2-4 uppercase letters).',
  certState: 'Please enter a valid cert state (2 uppercase letters).',
  dateOfBirth: 'Please enter a valid date format MM/DD/YYYY (Future dates are not allowed).',
  professionCode: 'Please enter a valid profession code (letters only).',
};
const REQUEST_ERROR_TITLE = 'Verification license request could not be completed';
const UNEXPECTED_REQUEST_ERROR_TITLE = 'An unexpected error occurred.';
const UNEXPECTED_REQUEST_ERROR_MESSAGE = 'Please try again shortly.';
const UNEXPECTED_PROFESSION_ERROR_MESSAGE = 'An unexpected error occurred while fetching professions.';
const STATE_OPTIONS = [
  {label: 'Alabama', value: 'AL'},
  {label: 'Alaska', value: 'AK'},
  {label: 'Arizona', value: 'AZ'},
  {label: 'Arkansas', value: 'AR'},
  {label: 'California', value: 'CA'},
  {label: 'Certification', value: 'CERT'},
  {label: 'Colorado', value: 'CO'},
  {label: 'Connecticut', value: 'CT'},
  {label: 'Delaware', value: 'DE'},
  {label: 'District of Columbia', value: 'DC'},
  {label: 'Florida', value: 'FL'},
  {label: 'Georgia', value: 'GA'},
  {label: 'Hawaii', value: 'HI'},
  {label: 'Idaho', value: 'ID'},
  {label: 'Illinois', value: 'IL'},
  {label: 'Indiana', value: 'IN'},
  {label: 'Iowa', value: 'IA'},
  {label: 'Kansas', value: 'KS'},
  {label: 'Kentucky', value: 'KY'},
  {label: 'Louisiana', value: 'LA'},
  {label: 'Maine', value: 'ME'},
  {label: 'Maryland', value: 'MD'},
  {label: 'Massachusetts', value: 'MA'},
  {label: 'Michigan', value: 'MI'},
  {label: 'Minnesota', value: 'MN'},
  {label: 'Mississippi', value: 'MS'},
  {label: 'Missouri', value: 'MO'},
  {label: 'Montana', value: 'MT'},
  {label: 'Nebraska', value: 'NE'},
  {label: 'Nevada', value: 'NV'},
  {label: 'New Hampshire', value: 'NH'},
  {label: 'New Jersey', value: 'NJ'},
  {label: 'New Mexico', value: 'NM'},
  {label: 'New York', value: 'NY'},
  {label: 'North Carolina', value: 'NC'},
  {label: 'North Dakota', value: 'ND'},
  {label: 'Ohio', value: 'OH'},
  {label: 'Oklahoma', value: 'OK'},
  {label: 'Oregon', value: 'OR'},
  {label: 'Pennsylvania', value: 'PA'},
  {label: 'Rhode Island', value: 'RI'},
  {label: 'South Carolina', value: 'SC'},
  {label: 'South Dakota', value: 'SD'},
  {label: 'Tennessee', value: 'TN'},
  {label: 'Texas', value: 'TX'},
  {label: 'Utah', value: 'UT'},
  {label: 'Vermont', value: 'VT'},
  {label: 'Virginia', value: 'VA'},
  {label: 'Washington', value: 'WA'},
  {label: 'West Virginia', value: 'WV'},
  {label: 'Wisconsin', value: 'WI'},
  {label: 'Wyoming', value: 'WY'},
];

export {
  COMPLETED_STATUS,
  FAILED_STATUS,
  QUEUED_STATUS,
  FILL_REQUIRED_FIELDS,
  FIELD_NOT_PROVIDED,
  ONLY_LETTERS_AND_SPACES_REGEX,
  ONLY_LETTERS_REGEX,
  ONLY_NUMBERS_REGEX,
  SSN_REGEX,
  STATE_CODE_REGEX,
  CERT_STATE_REGEX,
  ERROR_MESSAGES,
  ZIP_CODE_REGEX,
  REQUEST_ERROR_TITLE,
  UNEXPECTED_REQUEST_ERROR_TITLE,
  UNEXPECTED_REQUEST_ERROR_MESSAGE,
  UNEXPECTED_PROFESSION_ERROR_MESSAGE,
  STATE_OPTIONS,
};