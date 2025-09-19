import {ONLY_LETTERS_AND_SPACES_REGEX, ONLY_NUMBERS_REGEX, ERROR_MESSAGES} from './constants';

export function validateField(fieldName, value) {
  let isValid = false;
  let errorMessage = '';

  if (value) {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        isValid = ONLY_LETTERS_AND_SPACES_REGEX.test(value);
        errorMessage = isValid ? '' : ERROR_MESSAGES[fieldName];
        break;

      case 'npi':
        isValid = ONLY_NUMBERS_REGEX.test(value);
        errorMessage = isValid ? '' : ERROR_MESSAGES[fieldName];
        break;

      default:
        isValid = true;
        break;
    }
  } else {
    isValid = true;
  }

  return {isValid, errorMessage};
}

export function validateFields(component) {
  const fieldsToValidate = ['firstName', 'lastName', 'npi'];
  let isValid = true;

  fieldsToValidate.forEach(field => {
    const inputElement = component.template.querySelector(`[data-id=${field}]`);
    if (inputElement) {
      const value = inputElement.value.trim();
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
  if (!component.firstName || !component.lastName) {
    thereIsAnyRequiredFieldEmpty = true;
  }
  component.requiredFieldIsMissing = thereIsAnyRequiredFieldEmpty;
}