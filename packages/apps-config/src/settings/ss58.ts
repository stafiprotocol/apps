// Copyright 2017-2020 @polkadot/ui-settings authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TFunction } from 'i18next';
import type { Option } from './types';

// Definitions here are with the following values -
//   info: the name of a logo as defined in ../logos, specifically in namedLogos
//   text: The text you wish to display in the dropdown
//   value: The actual ss5Format value (as registered)

export function createSs58 (t: TFunction): Option[] {
  return [
    {
      info: 'stafi',
      text: t<string>('ss58.stafi', 'Stafi', { ns: 'apps-config' }),
      value: 20
    }
  ];
}
