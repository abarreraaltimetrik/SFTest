import {api} from 'lwc';
import LightningModal from 'lightning/modal';
import callFlow from '@salesforce/apex/MarketingCallToAction.callFlow';

const DIALOG_CONTENT =
  'Interested in receiving more verifications and primary source screenshots? Click “Yes” below and someone will be in touch shortly';
const DIALOG_HEADER = 'You’ve reached your monthly limit';

export default class MarketingModal extends LightningModal {
  @api content = DIALOG_CONTENT;
  @api header = DIALOG_HEADER;
  @api subHeader;

  handleYes() {
    callFlow();
    this.close(true);
  }

  handleNo() {
    this.close(false);
  }
}