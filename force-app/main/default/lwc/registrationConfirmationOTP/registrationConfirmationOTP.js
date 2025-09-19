import {LightningElement, wire} from 'lwc';
import {CurrentPageReference} from 'lightning/navigation';

import doRegisterOTP from '@salesforce/apex/CommunityRegisterController.validateOTP';

export default class RegistrationConfirmationOTP extends LightningElement {
  // Get the values for the query params of the page
  @wire(CurrentPageReference) pageRef;

  otp1 = '';
  otp2 = '';
  otp3 = '';
  otp4 = '';
  otp5 = '';
  otp6 = '';
  identifier = '';
  accData = {};
  errorMessage;

  handleNextElement(event) {
    const isTab = event.code === 'Tab' || event.keyCode === 16; // Tab or Shift
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
  handleOnClick(event) {
    console.log(event.target);
    event.target.selectionStart = 0;
    event.target.selectionEnd = event.target.value?.toString().length || 0;
  }

  checkForCompletion() {
    const otp = `${this.otp1}${this.otp2}${this.otp3}${this.otp4}${this.otp5}${this.otp6}`;
    if (otp.length === 6) {
      this.handleOTPSubmit(otp);
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

  async handleOTPSubmit(otp) {
    const missingField = this.template.querySelector(".otp-input[data-id='otp3']");
    console.log('otp', otp);

    if (otp.length !== 6) {
      missingField.setCustomValidity('* Miss!');
      missingField.reportValidity();
      missingField.setAttribute('required', true);
      return;
    }

    this.errorMessage = '';

    try {
      const response = await doRegisterOTP({
        identifier: this.identifier,
        code: otp,
      });

      const {token, message} = JSON.parse(response);

      console.log(response);

      if (token) {
        window.location.href = 'login?c__otp_validated=true';
      } else if (message) {
        this.errorMessage = message;
      }
    } catch (error) {
      this.errorMessage =
        error.body?.message || 'There was a problem during registration. Please contact us for further assistance.';
    }
  }

  renderedCallback() {
    if (!this.identifier) {
      this.identifier = this.pageRef?.state?.c__identifier;
      this.template.querySelector(".otp-input[data-id='otp1']")?.focus();
      console.log('DAta:');
      console.log(this.accData);
    }
  }
}