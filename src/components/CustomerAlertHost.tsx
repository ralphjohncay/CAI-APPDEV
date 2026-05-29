import React from 'react';

import {useCustomerAlerts} from '../hooks/useCustomerAlerts';

/** Invisible host — shows native Alert dialogs when admin updates orders or products. */
const CustomerAlertHost = (): null => {
  useCustomerAlerts();
  return null;
};

export default CustomerAlertHost;
