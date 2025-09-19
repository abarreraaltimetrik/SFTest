import {LightningElement, api} from 'lwc';

export default class SearchableInput extends LightningElement {
  @api cmpName; // The tag name of the host element of this component.
  @api label;
  @api options = [];
  @api placeholder;
  @api disabled = false;
  @api required = false;
  @api isLoading = false;

  isListening = false;
  searchResults;
  selectedSearchResult;

  @api get selectedValue() {
    return this.selectedSearchResult?.label ?? null;
  }

  @api get hasResults() {
    return this.searchResults?.length > 0;
  }

  renderedCallback() {
    if (this.isListening) return;

    window.addEventListener('click', event => {
      this.hideDropdown(event);
    });

    this.isListening = true;
  }

  /**
   * This function compares the name of the component (`cmpName`) with the name of the clicked element (`clickedElementSrcName`).
   * If the clicked element is outside the component, the dropdown (search results) is hidden by calling `clearSearchResults()`.
   *
   * - `cmpName` is the tag name of the host element of this component (e.g., 'C-SEARCHABLE-COMBOBOX').
   * - `clickedElementSrcName` is the tag name of the element that was clicked on the page.
   * - `isClickedOutside` is a boolean that is true if the clicked element is outside the component.
   */
  hideDropdown(event) {
    const clickedElementSrcName = event.target.tagName;
    const isClickedOutside = this.cmpName !== clickedElementSrcName;
    if (this.searchResults && isClickedOutside) {
      this.clearSearchResults();
    }
  }

  search(event) {
    const input = event.detail.value.toLowerCase();
    if (input) {
      const result = this.options.filter(pickListOption => pickListOption.label.toLowerCase().includes(input));
      this.searchResults = result;
    } else {
      this.searchResults = null;
    }
  }

  selectSearchResult(event) {
    const selectedValue = event.currentTarget.dataset.value;
    if (selectedValue !== this.selectedSearchResult?.value) {
      this.selectedSearchResult = this.options.find(pickListOption => pickListOption.value === selectedValue);
      this.emitEvent();
    }
    this.clearSearchResults();
  }

  handleClear(event) {
    if (this.selectSearchResult && !event.target.value) {
      this.resetInput();
      this.emitEvent();
    }
  }

  emitEvent() {
    // To send the change to the parent component, we dispatch a custom event "onselect"
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: this.selectedSearchResult,
      })
    );
  }

  @api
  clearSearchResults() {
    this.searchResults = null;
  }

  showPickListOptions() {
    if (!this.searchResults) {
      this.searchResults = this.options;
    }
  }

  @api
  resetInput() {
    this.selectedSearchResult = null;
    this.clearSearchResults();
  }
}