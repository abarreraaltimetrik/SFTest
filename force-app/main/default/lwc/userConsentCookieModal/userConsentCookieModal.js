import {api} from 'lwc';
import LightningModal from 'lightning/modal';
import CookieController from 'c/cookieController';
import {setCookieConsent} from 'lightning/userConsentCookie';

export default class UserConsentCookieModal extends LightningModal {
  checkedPreferences = true;
  checkedMarketing = true;
  checkedStatistics = true;

  changeTogglePreferences() {
    this.checkedPreferences = !this.checkedPreferences;
  }

  changeToggleMarketing() {
    this.checkedMarketing = !this.checkedMarketing;
  }

  changeToggleStatistics() {
    this.checkedStatistics = !this.checkedStatistics;
  }

  @api
  setContent() {
    setCookieConsent({
      Preferences: this.checkedPreferences,
      Marketing: this.checkedMarketing,
      Statistics: this.checkedStatistics,
    });
  }

  handleClickRejectAll() {
    this.checkedPreferences = false;
    this.checkedMarketing = false;
    this.checkedStatistics = false;
  }

  handleClickAcceptAll() {
    this.checkedPreferences = true;
    this.checkedMarketing = true;
    this.checkedStatistics = true;
  }

  @api
  handleClickSavePreferences() {
    this.setContent();
    CookieController.createCookie('cookieConsent', 'true', 365);
    this.close('setContent');
  }
}