import {LightningElement, track} from 'lwc';
import {passwordFieldUtils, getPasswordIcon} from 'c/passwordFieldUtils';

import doRegisterOTP from '@salesforce/apex/CommunityRegisterController.validateOTP';
import checkApiStatus from '@salesforce/apex/CommunityRegisterController.checkApiStatus';

import doRegister from '@salesforce/apex/CommunityRegisterController.doRegister';
import {
  DEFAULT_ERROR_MESSAGE,
  PASSWORDS_NOT_MATCH_MESSAGE,
  WELCOME_HEADER,
  SIGN_UP_COPY,
  CONTACT_US_TEXT,
  CONTACT_US_URL,
  TERMS_URL,
} from './utils/constants';

const INPUT_PASSWORD = 'inputPassword';
const PASSWORD_ICON_CLASS = 'passwordIcon';
const SHOW_PASSWORD = 'showPassword';

const INPUT_CONFIRM_PASSWORD = 'inputConfirmPassword';
const CONFIRM_PASSWORD_ICON_CLASS = 'confirmPasswordIcon';
const SHOW_CONFIRM_PASSWORD = 'showConfirmPassword';

export default class RegisterComponent extends LightningElement {
  otp1 = '';
  otp2 = '';
  otp3 = '';
  otp4 = '';
  otp5 = '';
  otp6 = '';
  otp = '';
  identifier = '';
  errorMessage;
  @track timeRemaining = 300;
  @track showTimer = false;

  timerInterval;
  apiCheckInterval;
  token;

  welcomeHeader = WELCOME_HEADER;
  signUpCopy = SIGN_UP_COPY;
  termsUrl = TERMS_URL;
  isDisable = false;
  isLoading = false;
  otpExecute = false;
  registerExecute = true;
  userInfo;

  showPassword;
  revealPassword;
  showConfirmPassword;
  revealConfirmPassword;

  constructor() {
    super();
    this.revealPassword = passwordFieldUtils.call(this, INPUT_PASSWORD, PASSWORD_ICON_CLASS, SHOW_PASSWORD);
    this.revealConfirmPassword = passwordFieldUtils.call(
      this,
      INPUT_CONFIRM_PASSWORD,
      CONFIRM_PASSWORD_ICON_CLASS,
      SHOW_CONFIRM_PASSWORD
    );
  }

  get errorMessageFormatted() {
    if (this.errorMessage.includes(CONTACT_US_TEXT)) {
      return this.errorMessage.replace(
        new RegExp(CONTACT_US_TEXT, 'i'),
        `<a href="${CONTACT_US_URL}" style="color: inherit; text-decoration: underline;" target="_blank">${CONTACT_US_TEXT}</a>`
      );
    }
    return this.errorMessage;
  }

  checkStoredTimer() {
    const storedEndTime = localStorage.getItem('otpTimerEndTime');
    const storedToken = localStorage.getItem('token');

    if (storedEndTime) {
      this.registerExecute = false;

      const now = new Date().getTime();
      // eslint-disable-next-line radix
      const endTime = parseInt(storedEndTime);
      if (endTime > now) {
        this.token = storedToken;
        this.showTimer = true;

        this.timeRemaining = Math.floor((endTime - now) / 1000);
        this.startTimer();
      } else {
        this.redirectToLogin();
      }
    }
  }

  connectedCallback() {
    this.checkStoredTimer();
  }

  disconnectedCallback() {
    this.clearTimerInterval();
    this.clearApiCheckInterval();
  }

  async handleRegister() {
    this.errorMessage = '';

    const allValid = [...this.template.querySelectorAll('lightning-input')].reduce((validSoFar, inputCmp) => {
      inputCmp.reportValidity();
      return validSoFar && inputCmp.checkValidity();
    }, true);

    if (allValid) {
      console.log('Registering the Client.');
      this.isDisable = true;
      this.isLoading = true;
      this.userInfo = {
        firstName: this.template.querySelector('.inputFirstName').value,
        lastName: this.template.querySelector('.inputLastName').value,
        email: this.template.querySelector('.inputEmail').value,
        password: this.template.querySelector('.inputPassword').value,
        companyName: this.template.querySelector('.inputCompanyName').value,
        jobTitle: this.template.querySelector('.inputJobTitle').value,
        phone: this.template.querySelector('.inputPhoneNumber').value,
      };

      try {
        const response = await doRegister(this.userInfo);

        const {status, identifier, message, code} = JSON.parse(response);

        console.log('Register: ', response);

        if (status === 'success' && identifier) {
          this.otpExecute = true;
          this.registerExecute = false;
          this.identifier = identifier;
          localStorage.setItem('identifier', identifier);
        } else if (message) {
          if (code === 'err_psw_policy') {
            const inputPassword = this.template.querySelector('.inputPassword');
            inputPassword.setCustomValidity(message);
            inputPassword.reportValidity();
          } else {
            this.errorMessage = message;
          }
        }
      } catch (error) {
        this.errorMessage = error.body?.message || DEFAULT_ERROR_MESSAGE;
      } finally {
        this.isDisable = false;
        this.isLoading = false;
      }
    }
  }

  checkPasswords() {
    const inputPassword = this.template.querySelector('.inputPassword');
    const inputConfirmPassword = this.template.querySelector('.inputConfirmPassword');
    if (inputPassword.value !== inputConfirmPassword.value) {
      inputPassword.setCustomValidity(PASSWORDS_NOT_MATCH_MESSAGE);
      inputConfirmPassword.setCustomValidity(PASSWORDS_NOT_MATCH_MESSAGE);
    } else {
      inputPassword.setCustomValidity('');
      inputConfirmPassword.setCustomValidity('');
    }
    inputPassword.reportValidity();
    inputConfirmPassword.reportValidity();
  }

  handleOnClick(event) {
    console.log(event.target);
    event.target.selectionStart = 0;
    event.target.selectionEnd = event.target.value?.toString().length || 0;
  }

  handleNextElement(event) {
    const isTab = event.code === 'Tab' || event.keyCode === 16;
    const target = isTab ? event.target.previousElementSibling : event.target;
    const nextTarget = isTab ? null : event.target.nextElementSibling;

    if (target?.value) {
      if (nextTarget) {
        nextTarget.focus();
        nextTarget.selectionStart = 0;
        nextTarget.selectionEnd = nextTarget.value?.toString().length || 0;
      } else {
        target.selectionStart = 0;
        target.selectionEnd = target.value?.toString().length || 0;
      }
    }
  }

  handleOTPChange1(event) {
    this.otp1 = event.target.value;
    this.checkForCompletion();
  }

  handleOTPChange2(event) {
    this.otp2 = event.target.value;
    this.checkForCompletion();
  }

  handleOTPChange3(event) {
    this.otp3 = event.target.value;
    this.checkForCompletion();
  }

  handleOTPChange4(event) {
    this.otp4 = event.target.value;
    this.checkForCompletion();
  }

  handleOTPChange5(event) {
    this.otp5 = event.target.value;
    this.checkForCompletion();
  }

  handleOTPChange6(event) {
    this.otp6 = event.target.value;
    this.checkForCompletion();
  }

  checkForCompletion() {
    this.otp = `${this.otp1}${this.otp2}${this.otp3}${this.otp4}${this.otp5}${this.otp6}`;
    if (this.otp.length === 6) {
      this.handleOTPSubmit(this.otp);
    }
  }

  redirectToLogin() {
    localStorage.removeItem('otpTimerEndTime');
    localStorage.removeItem('otpIsActive');
    localStorage.removeItem('token');
    localStorage.removeItem('identifier');

    window.location.href = 'login?c__otp_validated=true';
  }

  clearTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  clearApiCheckInterval() {
    if (this.apiCheckInterval) {
      clearInterval(this.apiCheckInterval);
    }
  }

  async checkApiStatus() {
    try {
      const result = await checkApiStatus({token: this.token});
      if (result.success) {
        this.clearTimerInterval();
        this.clearApiCheckInterval();
        this.redirectToLogin();
      }
    } catch (error) {
      console.error('Error checking API status:', error);
    }
  }

  startApiCheck() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.apiCheckInterval = setInterval(() => {
      this.checkApiStatus();
    }, 40000);
  }

  startTimer() {
    const endTime = new Date().getTime() + this.timeRemaining * 1000;
    localStorage.setItem('otpTimerEndTime', endTime.toString());
    localStorage.setItem('otpIsActive', 'true');

    this.clearTimerInterval();
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));

      if (timeLeft <= 0) {
        this.clearTimerInterval();
        this.redirectToLogin();
      } else {
        this.timeRemaining = timeLeft;
      }
    }, 1000);

    this.startApiCheck();
  }
  async handleOTPSubmit(otp) {
    const missingField = this.template.querySelector(".otp-input[data-id='otp3']");

    if (otp.length !== 6) {
      missingField.setCustomValidity('* Miss!');
      missingField.reportValidity();
      missingField.setAttribute('required', true);
      return;
    }
    this.isLoading = true;
    try {
      const response = await doRegisterOTP({
        identifier: this.identifier,
        code: otp,
      });

      const {token, message} = JSON.parse(response);

      if (token) {
        this.showTimer = true;
        this.otpExecute = false;
        this.token = token;
        localStorage.setItem('token', token);
        this.startTimer();
      } else if (message) {
        this.errorMessage = message;
      }
    } catch (error) {
      this.errorMessage =
        error.body?.message || 'There was a problem during registration. Please contact us for further assistance.';
    } finally {
      this.isLoading = false;
    }
  }

  get formattedTime() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  get passwordIcon() {
    return getPasswordIcon.call(this, INPUT_PASSWORD);
  }

  get passwordConfirmIcon() {
    return getPasswordIcon.call(this, INPUT_CONFIRM_PASSWORD);
  }

  clearOtpInputs() {
    for (let i = 1; i <= 6; i++) {
      const otpInput = this.template.querySelector(`[data-id="otp${i}"]`);
      if (otpInput) {
        otpInput.value = '';
        this[`otp${i}`] = '';
      }
    }
    this.otp = '';
  }

  async generateNewOtp() {
    this.errorMessage = '';
    console.log('Registering the Client.');

    try {
      const response = await doRegister(this.userInfo);

      const {status, identifier, message} = JSON.parse(response);

      if (status === 'success' && identifier) {
        this.isDisable = true;
        this.isLoading = true;
        this.identifier = identifier;
        console.log('new Otp: ', response);
      } else {
        this.errorMessage = message;
      }
    } catch (error) {
      this.errorMessage = error.body?.message || DEFAULT_ERROR_MESSAGE;
    } finally {
      this.isDisable = false;
      this.isLoading = false;
    }
  }

  handleRequestNewOTP() {
    this.clearOtpInputs();
    this.generateNewOtp();
  }

  beginPhoneNumberInput(event) {
    if (event.target.value.length === 0 && !isNaN(Number(event.key))) {
      event.target.value = '(' + event.target.value;
    }
  }

  formatPhoneNumber(event) {
    const input = event.target;
    const value = input.value;
    const keyPressed = event.key;
    let cursorPosition = input.selectionStart;

    // Remove all non-digit characters except -, (, )
    const nonAllowedCharacters = /[^\d()-]/g;
    const cleanedValue = value.replace(nonAllowedCharacters, '');
    // Remove existing formatting characters to reformat
    const digits = cleanedValue.replace(/[()-]/g, '');

    let formattedValue = '';
    if (cursorPosition === 1 && value === '(') {
      formattedValue = value;
    }
    if (digits.length > 0) {
      formattedValue = `(${digits.substring(0, 3)}`;
    }
    if (digits.length > 2) {
      formattedValue += `)${digits.substring(3, 6)}`;
    }
    if (digits.length > 5) {
      formattedValue += `-${digits.substring(6, 10)}`;
    }
    input.value = formattedValue;

    // Adjust cursor position
    const currentValuePosition = formattedValue[cursorPosition];
    const isFormattingCharacter = char => ['(', ')', '-'].includes(char);

    if (keyPressed === 'Backspace' || keyPressed === 'Delete') {
      if (isFormattingCharacter(currentValuePosition) && keyPressed === 'Delete') {
        cursorPosition += 1;
      }
    } else {
      if (value !== formattedValue) {
        if (!isNaN(Number(keyPressed))) {
          if (isFormattingCharacter(currentValuePosition)) {
            cursorPosition += 1;
          } else {
            const lastValuePosition = formattedValue[cursorPosition - 1];
            if (isFormattingCharacter(lastValuePosition) && !isNaN(Number(formattedValue[cursorPosition]))) {
              cursorPosition += 1;
            }
          }
        } else {
          cursorPosition -= 1;
        }
      } else if (!isNaN(Number(keyPressed))) {
        cursorPosition += 1;
      }
    }
    input.selectionStart = cursorPosition;
    input.selectionEnd = cursorPosition;
  }
}