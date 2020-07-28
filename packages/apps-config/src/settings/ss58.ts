// Copyright 2017-2020 @polkadot/ui-settings authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { TFunction } from 'i18next';
import { Option } from './types';

// Definitions here are with the following values -
//   info: the name of a logo as defined in ../logos, specifically in namedLogos
//   text: The text you wish to display in the dropdown
//   value: The actual ss5Format value (as registered)
export default function create (t: TFunction): Option[] {
  return [
    {
      info: 'stafi',
      text: t<string>('ss58.stafi', 'Stafi (Testnet)', { ns: 'apps-config' }),
      value: 20
    }
  ];
}
