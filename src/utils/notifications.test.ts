import { describe, expect, it } from 'vitest';

import { EnableNotifications, NotificationStatus } from '../types.js';
import { isNotificationEnabled } from './notifications.js';

describe('isNotificationEnabled', () => {
  it('returns true for globally enabled notifications', () => {
    const enabledParam: EnableNotifications = true;

    expect(isNotificationEnabled(enabledParam, NotificationStatus.INFO)).toBe(
      true,
    );
    expect(
      isNotificationEnabled(enabledParam, NotificationStatus.SUCCESS),
    ).toBe(true);
    expect(isNotificationEnabled(enabledParam, NotificationStatus.ERROR)).toBe(
      true,
    );
  });

  it('returns true when undefined', () => {
    const enabledParam = undefined;

    expect(isNotificationEnabled(enabledParam, NotificationStatus.INFO)).toBe(
      true,
    );
    expect(
      isNotificationEnabled(enabledParam, NotificationStatus.SUCCESS),
    ).toBe(true);
    expect(isNotificationEnabled(enabledParam, NotificationStatus.ERROR)).toBe(
      true,
    );
  });

  it('returns true for specifically enabled notification status', () => {
    const enabledStatusParam: EnableNotifications = {
      [NotificationStatus.INFO]: true,
      [NotificationStatus.SUCCESS]: false,
      [NotificationStatus.ERROR]: true,
    };

    expect(
      isNotificationEnabled(enabledStatusParam, NotificationStatus.INFO),
    ).toBe(true);
    expect(
      isNotificationEnabled(enabledStatusParam, NotificationStatus.SUCCESS),
    ).toBe(false);
    expect(
      isNotificationEnabled(enabledStatusParam, NotificationStatus.ERROR),
    ).toBe(true);
  });

  it('returns false for globally disabled notifications', () => {
    const disabledParam: EnableNotifications = false;

    expect(isNotificationEnabled(disabledParam, NotificationStatus.INFO)).toBe(
      false,
    );
    expect(
      isNotificationEnabled(disabledParam, NotificationStatus.SUCCESS),
    ).toBe(false);
    expect(isNotificationEnabled(disabledParam, NotificationStatus.ERROR)).toBe(
      false,
    );
  });

  it('returns false for missing notification status in specific configuration', () => {
    const partialParam: EnableNotifications = {
      [NotificationStatus.INFO]: true,
    };

    expect(isNotificationEnabled(partialParam, NotificationStatus.INFO)).toBe(
      true,
    );
    expect(
      isNotificationEnabled(partialParam, NotificationStatus.SUCCESS),
    ).toBe(false);
    expect(isNotificationEnabled(partialParam, NotificationStatus.ERROR)).toBe(
      false,
    );
  });
});
