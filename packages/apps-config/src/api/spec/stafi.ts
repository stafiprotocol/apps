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
            'RFIS',
            'RDOT',
            'RKSM'
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
        },
        BondKey: {
          symbol: 'RSymbol',
          bond_id: 'H256'
        },
        BondRecord: {
            bonder: 'AccountId',
            symbol: 'RSymbol',
            era: 'u32',
            pubkey: 'Vec<u8>',
            pool: 'Vec<u8>',
            blockhash: 'Vec<u8>',
            txhash: 'Vec<u8>',
            amount: 'u128'
        },
        BondReason: {
            _enum: [
                'Pass',
                'BlockhashUnmatch',
                'TxhashUnmatch',
                'PubkeyUnmatch',
                'PoolUnmatch',
                'AmountUnmatch'
            ]
        },
        LinkChunk: {
            pool: 'Vec<u8>',
            bond_value: 'u128',
            unbond_value: 'u128'
        },
        BondUnlockChunk: {
            value: 'u128',
            era: 'u32'
        },
        WithdrawChunk: {
            who: 'AccountId',
            recipient: 'Vec<u8>',
            value: 'u128',
            pool: 'Vec<u8>'
        },
        RproposalStatus: {
            _enum: [
                'Initiated',
                'Approved',
                'Rejected',
                'Expired'
            ]
        },
        RproposalVotes: {
            votes_for: 'Vec<AccountId>',
            votes_against: 'Vec<AccountId>',
            status: 'RproposalStatus',
            expiry: 'BlockNumber'
        }
      }
    }
  ]
};

export default definitions;
