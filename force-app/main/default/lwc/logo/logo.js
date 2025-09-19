import {LightningElement} from 'lwc';
import IMAGES from '@salesforce/resourceUrl/Images';

export default class Logo extends LightningElement {
  logoUrl = IMAGES + '/Logo.svg';
}