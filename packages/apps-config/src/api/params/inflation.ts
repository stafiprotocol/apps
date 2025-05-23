// Copyright 2017-2022 @polkadot/app-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { DOCK_POS_TESTNET_GENESIS, KUSAMA_GENESIS, NEATCOIN_GENESIS, NFTMART_GENESIS, POLKADOT_GENESIS, STAFI_GENESIS, STAFI_TESTNET_GENESIS } from '../constants';

interface InflationParams {
  auctionAdjust: number;
  auctionMax: number;
  falloff: number;
  maxInflation: number;
  minInflation: number;
  stakeTarget: number;
}

const DEFAULT_PARAMS: InflationParams = {
  auctionAdjust: 0,
  auctionMax: 0,
  falloff: 0.05,
  maxInflation: 0.06,
  minInflation: 0.01,
  stakeTarget: 0.5
};

const KNOWN_PARAMS: Record<string, InflationParams> = {
  [KUSAMA_GENESIS]: { ...DEFAULT_PARAMS, auctionAdjust: (0.3 / 60), auctionMax: 60, stakeTarget: 0.75 },
  [POLKADOT_GENESIS]: { ...DEFAULT_PARAMS, stakeTarget: 0.75 },
  [STAFI_GENESIS]: { ...DEFAULT_PARAMS, stakeTarget: 0.75 },
  [STAFI_TESTNET_GENESIS]: { ...DEFAULT_PARAMS, stakeTarget: 0.75 }
};

export function getInflationParams (api: ApiPromise): InflationParams {
  return KNOWN_PARAMS[api.genesisHash.toHex()] || DEFAULT_PARAMS;
}
