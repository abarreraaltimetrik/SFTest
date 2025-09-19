import {LightningElement, wire} from 'lwc';
import {CurrentPageReference} from 'lightning/navigation';
import doLoginWithSalesForce from '@salesforce/apex/CommunityAuthController.doLoginWithSalesForce';
import doLoginWithAws from '@salesforce/apex/CommunityAuthController.doLoginWithAws';
import getClientId from '@salesforce/apex/CommunityAuthController.getClientId';
import basePath from '@salesforce/community/basePath';
import isGuest from '@salesforce/user/isGuest';
import getCacheSession from '@salesforce/apex/VerificationsAPIController.getCacheSession';
import {passwordFieldUtils, getPasswordIcon} from 'c/passwordFieldUtils';

const INPUT_PASSWORD = 'inputPassword';
const PASSWORD_ICON_CLASS = 'passwordIcon';
const SHOW_PASSWORD = 'showPassword';

export default class LoginComponent extends LightningElement {
  username;
  password;
  errorCheck = false;
  errorMessage = '';
  isLoading = false;
  otpValidated = false;
  showPassword;
  revealPassword;

  constructor() {
    super();
    this.revealPassword = passwordFieldUtils.call(this, INPUT_PASSWORD, PASSWORD_ICON_CLASS, SHOW_PASSWORD);
    if (!isGuest) {
      getCacheSession()
        .then(cachedSession => {
          const isCommunityUser = !!cachedSession;
          if (!isGuest && isCommunityUser) {
            const sitePrefix = basePath.replace('/', '');
            window.location.replace(`/${sitePrefix}`);
          }
        })
        .catch(() => {
          console.info('Not a community user');
        });
    }
  }

  /*connectedCallback() {
    let meta = document.createElement("meta");
    meta.setAttribute("name", "viewport");
    meta.setAttribute("content", "width=device-width, initial-scale=1.0");
    if (window && document.head) {
      document.head.appendChild(meta);
    }
  }*/

  get passwordIcon() {
    return getPasswordIcon.call(this, INPUT_PASSWORD);
  }

  handleUserNameChange(event) {
    this.username = event.target.value.trim();
  }

  handlePasswordChange(event) {
    this.password = event.target.value.trim();
  }

  validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  async handleLogin(event) {
    event.preventDefault();
    this.isLoading = true;
    this.otpValidated = false;
    if (!this.username || !this.password || !this.validateEmail(this.username)) {
      this.errorCheck = true;
      this.errorMessage = 'Please enter a valid e-mail and password.';
      this.isLoading = false;
      return;
    }

    this.username = this.username.toLowerCase();

    try {
      const pageRef = await doLoginWithSalesForce({
        username: this.username,
        password: this.password,
      });

      if (pageRef) {
        const result = await getClientId({username: this.username});
        await doLoginWithAws({
          username: this.username,
          password: this.password,
          clientId: result.clientId,
          userId: result.userId,
        });

        window.location.replace(pageRef);
      }
    } catch (error) {
      this.errorCheck = true;
      this.errorMessage = 'Your login attempt has failed. Make sure the email or username and password are correct.';
      console.error('Login error:', error);
      this.isLoading = false;
    }
  }

  // Get the values for the query params of the page
  @wire(CurrentPageReference)
  getStateParameters(currentPageReference) {
    if (currentPageReference.state?.c__otp_validated) {
      this.otpValidated = true;
      // Remove the query param from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}