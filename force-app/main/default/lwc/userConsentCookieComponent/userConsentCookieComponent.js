import {LightningElement, api} from 'lwc';
import CookieController from 'c/cookieController';
import UserConsentModal from 'c/userConsentCookieModal';
import {setCookieConsent} from 'lightning/userConsentCookie';

const COOKIE_CONSENT_NAME = 'cookieConsent';

export default class UserConsentCookieComponent extends LightningElement {
  renderedCallback() {
    const cookieConsent = CookieController.loadCookie(COOKIE_CONSENT_NAME);
    if (!cookieConsent) {
      this.setToastVisibility('visible');
    }
  }

  handleClickAcceptAll() {
    setCookieConsent({
      Preferences: true,
      Marketing: true,
      Statistics: true,
    });
    this.setToastVisibility('hidden');
    this.saveCookie();
  }

  handleClickRejectAll() {
    setCookieConsent({
      Preferences: false,
      Marketing: false,
      Statistics: false,
    });
    this.setToastVisibility('hidden');
    this.saveCookie();
  }

  saveCookie() {
    CookieController.createCookie(COOKIE_CONSENT_NAME, 'true', 365);
  }

  @api
  setToastVisibility(visibility) {
    const toast = this.template.querySelector('.consent-cookie-toast');
    toast.style.visibility = visibility;
  }

  async handleClickCustomize() {
    this.setToastVisibility('hidden');
    const result = await UserConsentModal.open({
      size: 'small',
    });
    if (result === 'setContent') {
      this.saveCookie();
    } else {
      this.setToastVisibility('visible');
    }
  }
}