// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Route } from './types';

// import Component, { useCounter } from '@stafi/app-rswap';

import Modal from '@polkadot/app-accounts/modals/Rswap';

export default function create (t: <T = string> (key: string, text: string, options: { ns: string }) => T): Route {
  return {
    Component: Modal,
    Modal,
    display: {
      isHidden: false,
      needsAccounts: true,
      needsApi: [
        'tx.bridgeSwap.transferNative'
      ]
    },
    group: 'accounts',
    icon: 'star',
    name: 'rBridge',
    text: t<string>('nav.rswap', 'rBridge beta', { ns: 'apps-routing' })
  };
}
