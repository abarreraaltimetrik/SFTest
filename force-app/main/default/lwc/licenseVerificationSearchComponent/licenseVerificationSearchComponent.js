import {LightningElement, track} from 'lwc';
import modalController from 'c/modalController';
import searchLicenses from '@salesforce/apex/VerificationsAPIController.searchLicenses';
import getProfessionsByState from '@salesforce/apex/ProfessionsController.getProfessionsByState';
import createVerificationBatch from '@salesforce/apex/VerificationsBatchObjectController.createVerificationBatch';
import {validateFields, checkRequiredFields} from './utils/validation';
import {
  FILL_REQUIRED_FIELDS,
  QUEUED_STATUS,
  FIELD_NOT_PROVIDED,
  REQUEST_ERROR_TITLE,
  UNEXPECTED_REQUEST_ERROR_TITLE,
  UNEXPECTED_REQUEST_ERROR_MESSAGE,
  UNEXPECTED_PROFESSION_ERROR_MESSAGE,
  STATE_OPTIONS,
} from './utils/constants';

class CustomError extends Error {
  constructor(message) {
    super(message);
    this.body = {message};
  }
}

export default class LicenseSearch extends LightningElement {
  licenseNumber = '';
  stateCode = '';
  professionCode = '';
  firstName = '';
  middleName = '';
  lastName = '';
  certState = '';
  dateOfBirth = '';
  socialSecurityNumber = '';
  zipCode = '';
  isLoading = false;
  hasInvalidFields = false;
  currentDate = this.getCurrentDate();

  shouldShowErrorInField = false;
  requiredFieldIsMissing = false;

  shouldShowRequestError = false;

  @track result = null;
  @track errorObject = {};

  cmpName = this.template.host.tagName;
  stateOptions = STATE_OPTIONS;
  professionOptions = [];
  isLoadingProfessions = false;

  get showResultContent() {
    return this.result && !this.isLoading;
  }

  get shouldDisableInputFields() {
    return (this.result && !this.isLoading) || this.isLoading;
  }

  get shouldDisableProfessionInput() {
    return !this.stateCode || this.shouldDisableInputFields;
  }

  get shouldShowError() {
    return this.shouldShowRequestError || this.shouldShowErrorInField;
  }

  setRequestErrorObject(e) {
    const customErrorBody = e.body?.message || null;
    this.shouldShowRequestError = true;
    if (customErrorBody) {
      this.errorObject = JSON.parse(customErrorBody);
      this.errorObject.title = REQUEST_ERROR_TITLE;
    } else {
      console.error(e);
      this.errorObject = {
        message: UNEXPECTED_REQUEST_ERROR_MESSAGE,
        title: UNEXPECTED_REQUEST_ERROR_TITLE,
      };
    }
  }

  clearRequestErrorObject() {
    this.errorObject = {};
    this.shouldShowRequestError = false;
  }

  getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  handleInputChange(event) {
    const {name: field, value} = event.target;
    this[field] = value;
    if (!value) {
      const inputElement = this.template.querySelector(`[data-id=${field}]`);
      if (inputElement) {
        inputElement.setCustomValidity('');
        inputElement.reportValidity();
      }
    }
  }

  clearForm() {
    this.licenseNumber = '';
    this.firstName = '';
    this.middleName = '';
    this.lastName = '';
    this.certState = '';
    this.dateOfBirth = '';
    this.socialSecurityNumber = '';
    this.zipCode = '';
    this.clearState();
    this.clearProfession();
  }

  async submitForm() {
    this.isLoading = true;
    const requestBody = {
      licenses: [
        {
          stateCode: this.stateCode.trim() || undefined,
          professionCode: this.professionCode.trim() || undefined,
          licenseNumber: this.licenseNumber.trim() || undefined,
          firstName: this.firstName.trim() || undefined,
          middleName: this.middleName.trim() || undefined,
          lastName: this.lastName.trim() || undefined,
          certState: this.certState.trim() || undefined,
          dateOfBirth: this.dateOfBirth ? this.dateOfBirth.trim().replace(/-/g, '') : undefined,
          socialSecurityNumber: undefined,
          zipCode: undefined,
        },
      ],
    };

    try {
      const objectResponse = await searchLicenses({requestBody});
      if (objectResponse.error) {
        const hasRateLimitError = objectResponse.statusCode === 429;
        if (hasRateLimitError) {
          await modalController.showMarketingModal();
        }
        throw new CustomError(objectResponse.message);
      }
      this.result = objectResponse;
      this.result.formDataInput = {
        licenseNumber: this.licenseNumber || FIELD_NOT_PROVIDED,
        stateCode: this.stateCode || FIELD_NOT_PROVIDED,
        professionCode: this.professionCode || FIELD_NOT_PROVIDED,
        firstName: this.firstName || FIELD_NOT_PROVIDED,
        middleName: this.middleName || FIELD_NOT_PROVIDED,
        lastName: this.lastName || FIELD_NOT_PROVIDED,
        certState: this.certState || FIELD_NOT_PROVIDED,
        dateOfBirth: this.dateOfBirth || FIELD_NOT_PROVIDED,
        socialSecurityNumber: FIELD_NOT_PROVIDED,
        zipCode: FIELD_NOT_PROVIDED,
      };

      await createVerificationBatch({
        batchId: this.result.batchId,
        input: JSON.stringify(requestBody),
        addedAt: this.result.addedAt,
        status: QUEUED_STATUS,
      });
    } catch (e) {
      this.setRequestErrorObject(e);
      this.result = null;
    } finally {
      this.isLoading = false;
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.clearRequestErrorObject(this);
    this.hideProfessionAndStateLists();

    checkRequiredFields(this);
    if (this.requiredFieldIsMissing) {
      this.shouldShowErrorInField = true;
      this.fieldErrorMessage = FILL_REQUIRED_FIELDS;
      return;
    }

    this.shouldShowErrorInField = false;
    this.fieldErrorMessage = null;
    validateFields(this);
    if (!this.hasInvalidFields) {
      this.submitForm();
    }
  }

  handleClearButtonClick() {
    this.clearForm();
    this.result = null;
  }

  clearState() {
    this.stateCode = '';
    this.template.querySelector('[data-id=state]').resetInput();
  }

  clearProfession() {
    this.professionCode = '';
    this.professionOptions = [];
    this.template.querySelector('[data-id=profession]').resetInput();
  }

  async handleStateChange(event) {
    this.clearProfession();

    const value = event.detail?.value;
    this.stateCode = value;

    if (!value) {
      return;
    }

    this.shouldShowRequestError = false;
    this.isLoadingProfessions = true;

    try {
      const resultProfessions = await getProfessionsByState({stateCode: this.stateCode});
      this.professionOptions = resultProfessions.map(profession => ({
        label: profession.ProfessionName__c,
        value: profession.ProfessionCode__c,
      }));
    } catch (e) {
      this.shouldShowRequestError = true;
      this.fieldErrorMessage = UNEXPECTED_PROFESSION_ERROR_MESSAGE;
      console.error(e);
    }

    this.isLoadingProfessions = false;
  }

  handleProfessionChange(event) {
    const value = event.detail?.value;
    this.professionCode = value;
  }

  hideProfessionsList() {
    this.template.querySelector('[data-id=profession]').clearSearchResults();
  }

  hideStatesList() {
    this.template.querySelector('[data-id=state]').clearSearchResults();
  }

  hideProfessionAndStateLists() {
    this.hideProfessionsList();
    this.hideStatesList();
  }
}