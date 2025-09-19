import {
  ONLY_LETTERS_AND_SPACES_REGEX,
  ONLY_LETTERS_REGEX,
  ZIP_CODE_REGEX,
  SSN_REGEX,
  STATE_CODE_REGEX,
  CERT_STATE_REGEX,
  ERROR_MESSAGES,
} from './constants';

function isFutureDate(date) {
  const today = new Date();
  const selectedDate = new Date(date);
  return selectedDate >= today;
}

function isValidDate(date) {
  if (date === null) return false;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) {
    return false;
  }

  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function validateField(fieldName, value) {
  let isValid = false;
  let errorMessage = '';

  if (value) {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
      case 'middleName':
        isValid = ONLY_LETTERS_AND_SPACES_REGEX.test(value);
        errorMessage = isValid ? '' : ERROR_MESSAGES[fieldName];
        break;

      case 'professionCode':
        isValid = ONLY_LETTERS_REGEX.test(value);
        errorMessage = isValid ? '' : ERROR_MESSAGES[fieldName];
        break;

      case 'zipCode':
        isValid = ZIP_CODE_REGEX.test(value);
        errorMessage = isValid ? '' : ERROR_MESSAGES[fieldName];
        break;

      case 'socialSecurityNumber':
        isValid = SSN_REGEX.test(value);
        errorMessage = isValid ? '' : ERROR_MESSAGES[fieldName];
        break;

      case 'stateCode':
        isValid = STATE_CODE_REGEX.test(value);
        errorMessage = isValid ? '' : ERROR_MESSAGES[fieldName];
        break;

      case 'certState':
        isValid = CERT_STATE_REGEX.test(value);
        errorMessage = isValid ? '' : ERROR_MESSAGES[fieldName];
        break;

      case 'dateOfBirth':
        isValid = isValidDate(value) && !isFutureDate(value);
        errorMessage = isValid ? '' : ERROR_MESSAGES[fieldName];
        break;

      default:
        isValid = true;
        break;
    }
  } else {
    if (fieldName === 'dateOfBirth' && value === null) {
      isValid = false;
      errorMessage = ERROR_MESSAGES[fieldName];
    } else {
      isValid = true;
    }
  }

  return {isValid, errorMessage};
}

export function validateFields(component) {
  const fieldsToValidate = [
    'firstName',
    'lastName',
    'middleName',
    'zipCode',
    'socialSecurityNumber',
    'certState',
    'stateCode',
    'dateOfBirth',
    'professionCode',
  ];
  let isValid = true;

  fieldsToValidate.forEach(field => {
    const inputElement = component.template.querySelector(`[data-id=${field}]`);
    if (inputElement) {
      const value = inputElement.value;
      const {isValid: fieldIsValid, errorMessage} = validateField(field, value);

      inputElement.setCustomValidity(errorMessage);
      if (!fieldIsValid) {
        isValid = false;
      }
      inputElement.reportValidity();
    }
  });

  component.hasInvalidFields = !isValid;
}

export function checkRequiredFields(component) {
  let thereIsAnyRequiredFieldEmpty = false;
  if (!component.licenseNumber || !component.stateCode || !component.professionCode) {
    thereIsAnyRequiredFieldEmpty = true;
  }
  component.requiredFieldIsMissing = thereIsAnyRequiredFieldEmpty;
}