// Copyright 2017-2021 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverrideBundleDefinition } from '@polkadot/types/types';

// structs need to be in order
/* eslint-disable sort-keys */

const definitions: OverrideBundleDefinition = {
  types: [
    {
      // on all versions
      minmax: [0, undefined],
      types: {
        RefCount: 'u32',
        ChainId: 'u8',
        ResourceId: '[u8; 32]',
        DepositNonce: 'u64',
        RateType: 'u64',
        AccountRData: {
          free: 'u128'
        },
        RSymbol: {
          _enum: [
            'RFIS'
          ]
        },
        ProposalStatus: {
          _enum: [
            'Active',
            'Passed',
            'Expired',
            'Executed'
          ]
        },
        ProposalVotes: {
            voted: 'Vec<AccountId>',
            status: 'ProposalStatus',
            expiry: 'BlockNumber'
        }
      }
    }
  ]
};

export default definitions;
