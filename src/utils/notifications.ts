import {
  EnableNotifications,
  EnableNotificationsParam,
  NotificationStatus,
} from '../types.js';

export const DEFAULT_ENABLE_NOTIFICATIONS: EnableNotificationsParam = {
  enableNotifications: true,
};

export const isNotificationEnabled = (
  enableNotifications: EnableNotifications | undefined,
  notificationStatus: NotificationStatus,
) => {
  if (enableNotifications === undefined) {
    return true;
  }

  if (typeof enableNotifications === 'boolean') {
    return enableNotifications;
  }

  return Boolean(enableNotifications[notificationStatus]);
};
