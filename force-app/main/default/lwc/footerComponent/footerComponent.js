import {LightningElement} from 'lwc';

export default class FooterComponent extends LightningElement {
  currentYear = new Date().getFullYear();
}