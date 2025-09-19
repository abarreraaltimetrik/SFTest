import {LightningElement} from 'lwc';
import isGuest from '@salesforce/user/isGuest';
import basePath from '@salesforce/community/basePath';

export default class LogoutComponent extends LightningElement {
  isDisable = false;
  get isGuest() {
    return isGuest;
  }

  handleLogout() {
    const sitePrefix = basePath.replace('/', '');
    const logoutUrl = `/${sitePrefix}vforcesite/secur/logout.jsp`;
    window.location.href = logoutUrl;
    this.isDisable = true;
  }
}