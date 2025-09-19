import {createCookie, loadCookie} from 'c/cookieController';
import marketingModal from 'c/marketingContactModal';

const DIALOG_TITLE = 'Do you want to be contacted?';

const showMarketingModal = async function () {
  const wasShownCookie = loadCookie('modalShown');
  if (wasShownCookie) {
    return;
  }
  const dialogResult = await marketingModal.open({
    title: DIALOG_TITLE,
  });
  if (dialogResult) {
    createCookie('modalShown', true, 365);
  }
};

export default {showMarketingModal};