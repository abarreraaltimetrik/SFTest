const SHOW = 'Show password';
const HIDE = 'Hide password';
const SUCCESS = 'success';
const INPUT_TYPES = {
  TEXT: 'text',
  PASSWORD: 'password',
};
const ICONS = {
  PREVIEW: 'utility:preview',
  HIDE: 'utility:hide',
};

function revealPassword(inputId, iconClass, statusVariable) {
  const inputDocument = this.template.querySelector(`[data-id="${inputId}"]`);
  const iconDocument = this.template.querySelector(`.${iconClass}`);
  if (inputDocument.type === INPUT_TYPES.PASSWORD) {
    this[statusVariable] = HIDE;
    inputDocument.type = INPUT_TYPES.TEXT;
    iconDocument.variant = undefined;
  } else {
    this[statusVariable] = SHOW;
    inputDocument.type = INPUT_TYPES.PASSWORD;
    iconDocument.variant = SUCCESS;
  }
}

export function getPasswordIcon(inputId) {
  const inputDocument = this.template.querySelector(`[data-id="${inputId}"]`);
  if (!inputDocument) {
    return ICONS.PREVIEW;
  }
  return inputDocument.type === INPUT_TYPES.PASSWORD ? ICONS.PREVIEW : ICONS.HIDE;
}

export function passwordFieldUtils(inputId, iconClass, statusVariable) {
  this[statusVariable] = SHOW;

  return revealPassword.bind(this, inputId, iconClass, statusVariable);
}