import {LightningElement, track} from 'lwc';
import ModalController from 'c/modalController';
import searchProfessionals from '@salesforce/apex/VerificationsAPIController.searchProfessionals';
import {validateFields, checkRequiredFields} from './utils/validation';
import {
  FILL_REQUIRED_FIELDS,
  REQUEST_ERROR_TITLE,
  UNEXPECTED_REQUEST_ERROR_TITLE,
  UNEXPECTED_REQUEST_ERROR_MESSSAGE,
} from './utils/constants';

class CustomError extends Error {
  constructor(message) {
    super(message);
    this.body = {message};
  }
}

export default class ProfessionalExclusionSearchComponent extends LightningElement {
  firstName = '';
  lastName = '';
  npi = null;
  isLoading = false;
  @track result = null;
  @track error = null;
  @track showJsonViewer = false;

  jsonViewer;

  shouldShowErrorInField = false;
  requiredFieldIsMissing = false;

  shouldShowRequestError = false;

  connectedCallback() {
    if (!this.isScriptLoaded()) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@textea/json-viewer@3';
      script.onload = () => {
        this.initializeLibrary();
      };
      script.onerror = e => {
        console.error('Error loading the script: ', e);
      };
      document.head.appendChild(script);
    }
  }

  isScriptLoaded() {
    return Array.from(document.head.getElementsByTagName('script')).some(
      script => script.src === 'https://cdn.jsdelivr.net/npm/@textea/json-viewer@3'
    );
  }

  initializeLibrary() {
    if (window.JsonViewer) {
      this.jsonViewer = window.JsonViewer;
    } else {
      console.log('JsonViewer library is not available.');
    }
  }

  renderJsonViewer() {
    if (this.result && this.jsonViewer) {
      try {
        const container = this.template.querySelector('.json-viewer-container');
        if (container) {
          new this.jsonViewer({
            value: this.result,
          }).render(container);
          this.showJsonViewer = true;
        } else {
          console.log('Json container not found.');
        }
      } catch (e) {
        console.log('Error rendering JSON:', e);
      }
    } else {
      console.log('No result or JsonViewer not initialized.');
    }
  }

  get shouldDisableInputFields() {
    return this.result && !this.isLoading;
  }

  get shouldDisableSummitButton() {
    return this.result || this.isLoading;
  }

  get jsonViewerContainerClass() {
    return `json-viewer-container ${this.showJsonViewer ? '' : 'hidden'}`;
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
        message: UNEXPECTED_REQUEST_ERROR_MESSSAGE,
        title: UNEXPECTED_REQUEST_ERROR_TITLE,
      };
    }
  }

  clearRequestErrorObject() {
    this.errorObject = {};
    this.shouldShowRequestError = false;
  }

  handleInputChange(event) {
    this.error = null;
    const {name: field, value} = event.target;
    this[field] = value;
    if (!value) {
      const inputElement = this.template.querySelector(`[data-id=${field}]`);
      inputElement.setCustomValidity('');
      inputElement.reportValidity();
    }
  }

  handleClearClick() {
    this.firstName = '';
    this.lastName = '';
    this.npi = '';
    this.error = null;
    this.result = null;
    this.showJsonViewer = false;
  }

  async submitForm() {
    this.isLoading = true;
    const requestBody = {
      name: `${this.firstName} ${this.lastName}`.trim() || undefined,
      npi: this.npi || undefined,
    };

    try {
      const objectResponse = await searchProfessionals({requestBody});
      if (objectResponse.error) {
        const hasRateLimitError = objectResponse.statusCode === 429;
        if (hasRateLimitError) {
          await ModalController.showMarketingModal();
        }
        throw new CustomError(objectResponse.message);
      }

      this.result = objectResponse;
      if (this.jsonViewer) {
        this.renderJsonViewer();
        this.error = null;
      } else {
        console.warn('JsonViewer is not initialized yet.');
      }
    } catch (e) {
      this.setRequestErrorObject(e);
      this.result = null;
    } finally {
      this.isLoading = false;
    }
  }

  handleSubmitClick(event) {
    event.preventDefault();
    this.clearRequestErrorObject(this);

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
}