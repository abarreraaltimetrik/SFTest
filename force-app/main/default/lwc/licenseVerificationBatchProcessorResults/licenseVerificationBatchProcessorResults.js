import {LightningElement, track} from 'lwc';
import ModalController from 'c/modalController';
import getVerificationBatchesByStatus from '@salesforce/apex/VerificationsBatchObjectController.getVerificationBatchesByStatus';
import updateBatches from '@salesforce/apex/VerificationsBatchObjectController.updateBatches';
import getBatchRecordsByClientId from '@salesforce/apex/VerificationsBatchObjectController.getBatchRecordsByClientId';
import getLicenseResults from '@salesforce/apex/VerificationsAPIController.getLicenseResults';
import basePath from '@salesforce/community/basePath';
import {
  QUEUED_STATUS,
  FAILED_STATUS,
  FETCH_BATCHES_ERROR_MESSAGE,
  SESSION_IS_NOT_ACTIVE_MESSAGE,
} from './utils/constants';

export default class BatchProcessor extends LightningElement {
  @track queuedRecords = [];
  @track lastRecords = [];
  @track error;
  @track isLoading;
  @track batchesToShow = [];
  @track expandedRows = [];

  columns = [
    {label: 'Request ID', fieldName: 'Batch_Id__c'},
    {
      label: 'License Number',
      fieldName: 'LicenseNumber',
      type: 'text',
      cellAttributes: {class: 'slds-text-color_default'},
    },
    {label: 'Status', fieldName: 'Status__c'},
    {label: 'Added At', fieldName: 'Added_At__c', type: 'dateTime'},
    {
      type: 'button-icon',
      typeAttributes: {
        iconName: 'utility:arrowdown',
        name: 'expand',
        alternativeText: 'Expand Row',
        title: 'Expand Row',
      },
      cellAttributes: {
        class: 'slds-text-align_right',
      },
    },
  ];

  connectedCallback() {
    this.fetchBatches();
  }

  handleRefresh() {
    this.fetchBatches();
  }

  async processBatchesInParallel(batchIds) {
    const promises = batchIds.map(batchId => getLicenseResults({batchId}));

    const results = await Promise.allSettled(promises);

    const hasRateLimitError = results.some(result => result?.value?.statusCode === 429);
    if (hasRateLimitError) {
      await ModalController.showMarketingModal();
    }

    return results.map((requestResult, index) => {
      const thereIsUncontrolledError = requestResult?.status === 'rejected';
      const thereIsRequestError = requestResult?.value?.error || false;
      if (thereIsUncontrolledError || thereIsRequestError) {
        const errorMessage = thereIsRequestError ? requestResult.value.message : requestResult.reason.body.message;
        const formattedErrorMessage = this.parseJson(errorMessage);
        return {
          Batch_Id__c: batchIds[index],
          Result__c: errorMessage,
          Status__c: formattedErrorMessage?.status === 404 ? FAILED_STATUS : QUEUED_STATUS,
        };
      }

      const [firstLicense = {}] = requestResult?.value?.licenses ?? [];
      const {result, code, status, message} = firstLicense;
      const resultToStore = {
        ...result,
        code,
        message,
      };
      // eslint-disable-next-line no-unused-vars
      const {screenshotURL, screenshotToken, ...restResult} = resultToStore;

      return {
        Batch_Id__c: batchIds[index],
        Result__c: JSON.stringify(restResult),
        Status__c: status,
      };
    });
  }

  buildUpdatedRegisters({currentBatchesData, updatedBatchesData}) {
    const updatedBatchesMap = new Map(updatedBatchesData.map(batch => [batch.Batch_Id__c, batch]));
    const updatedBatchesAux = structuredClone(currentBatchesData);
    return updatedBatchesAux.map(currentBatchDataAux => {
      const updatedBatch = updatedBatchesMap.get(currentBatchDataAux.Batch_Id__c);
      if (updatedBatch && updatedBatch.Result__c) {
        currentBatchDataAux.Result__c = updatedBatch.Result__c;
        currentBatchDataAux.Status__c = updatedBatch.Status__c;
      }
      return currentBatchDataAux;
    });
  }

  async updateClientQueuedBatches() {
    let updatedRegisters = [];
    const queuedBatches = await getVerificationBatchesByStatus({
      status: QUEUED_STATUS,
    });
    const queuedBatchIds = queuedBatches?.map(batch => batch.Batch_Id__c) || [];
    let updatedQueueBatches = [];

    if (queuedBatchIds.length > 0) {
      updatedQueueBatches = await this.processBatchesInParallel(queuedBatchIds);
    }

    if (updatedQueueBatches.length > 0) {
      updatedRegisters = this.buildUpdatedRegisters({
        currentBatchesData: queuedBatches,
        updatedBatchesData: updatedQueueBatches,
      });
      await updateBatches({batchesData: updatedRegisters});
    }
    return updatedRegisters;
  }

  async fetchBatches() {
    try {
      this.error = null;
      this.isLoading = true;
      await this.updateClientQueuedBatches();
      const clientBatchRecords = await getBatchRecordsByClientId();
      if (clientBatchRecords) {
        this.batchesToShow = clientBatchRecords.map(batch => ({
          ...batch,
          licenseNumber: JSON.parse(batch.Input__c).licenses[0].licenseNumber || 'No License Number',
          isExpanded: false,
          iconName: 'utility:arrowdown',
        }));
      }
    } catch (e) {
      const isSessionNotActive = e.body?.message === SESSION_IS_NOT_ACTIVE_MESSAGE;
      const errorMessage = isSessionNotActive ? SESSION_IS_NOT_ACTIVE_MESSAGE : FETCH_BATCHES_ERROR_MESSAGE;
      this.error = errorMessage;

      const errorInConsole = e.body ? e.body.message : `Error fetching batches: ${e}`;
      console.error(`${errorInConsole}`);

      this.batchesToShow = [];
      /*
        TODO: Make this work
      if (!isGuest) {
        this.redirectToLogin();
      } */
    } finally {
      this.isLoading = false;
    }
  }

  handleRowExpand(event) {
    const batchId = event.target.dataset.id;
    this.batchesToShow = this.batchesToShow.map(batch => {
      if (batch.Batch_Id__c === batchId) {
        const isExpanded = !batch.isExpanded;
        const batchInputLicense = this.parseJson(batch.Input__c);
        return {
          ...batch,
          isExpanded,
          iconName: isExpanded ? 'utility:arrowup' : 'utility:arrowdown',
          expandedKey: `${batch.Batch_Id__c}-expanded`,
          formattedInput: batchInputLicense.licenses.length > 0 ? batchInputLicense.licenses[0] : {},
          formattedResult: this.formatJson(batch.Result__c),
        };
      }
      return batch;
    });
  }

  formatJson(str) {
    try {
      const parsedInput = typeof str === 'string' ? JSON.parse(str) : {};
      parsedInput.hasDisciplinaryActionAttribute = false;
      if ('disciplinaryAction' in parsedInput) {
        parsedInput.hasDisciplinaryActionAttribute = true;
      }
      return parsedInput;
    } catch (error) {
      return {};
    }
  }

  parseJson(str) {
    try {
      return typeof str === 'string' ? JSON.parse(str) : str;
    } catch (error) {
      return str;
    }
  }

  redirectToLogin() {
    const sitePrefix = basePath.replace('/', '');
    const logoutUrl = `/${sitePrefix}vforcesite/secur/logout.jsp`;
    window.location.href = logoutUrl;
  }
}