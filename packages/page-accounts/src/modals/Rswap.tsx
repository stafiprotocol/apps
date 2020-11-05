// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Balance } from '@polkadot/types/interfaces';
import { Option } from '@polkadot/types';

import BN from 'bn.js';
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { InputAddress, InputBalance, Input, Modal, Static, TxButton, Dropdown } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';
import { Available, FormatBalance } from '@polkadot/react-query';
import { BN_ZERO, BN_TEN, formatBalance } from '@polkadot/util';
import { keccakAsHex } from '@polkadot/util-crypto';

import { useTranslation } from '../translate';

interface Props {
  className?: string;
  onClose: () => void;
  senderId?: string;
}

const transformChainFees = {
  transform: (value: Option<Balance>) => value.unwrapOr(null)
};

function checkAddressChecksum(address: string) {
  // Check each case
  address = address.replace(/^0x/i, '');
  var addressHash = keccakAsHex(address.toLowerCase()).substr(2);

  for (var i = 0; i < 40; i++) {
      // the nth letter should be uppercase if the nth digit of casemap is 1
    if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i])
      || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
          return false;
      }
  }
  return true;
};

function isEthAddress(address: string) {
  // check if it has the basic requirements of an address
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
    // If it's ALL lowercase or ALL upppercase
  } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
    return true;
    // Otherwise check each case
  } else {
    return checkAddressChecksum(address);
  }
};

const ethChainId = 2;

function Swap ({ className = '', onClose, senderId: propSenderId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [amount, setAmount] = useState<BN | undefined>(BN_ZERO);
  const [hasAvailable] = useState(true);
  const [ethAddressAvailable, setEthAddressAvailable] = useState(false);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);

  const chainFees = useCall<Balance | null>(api.query.bridgeCommon.chainFees, [ethChainId], transformChainFees);

  const transferrable = <span className='label'>{t<string>('transferrable')}</span>;

  const si = formatBalance.findSi('-');

  const onChangeEthereumAddress = useCallback((value: string) => {
    if (value && value.length == 42) {
      setEthAddressAvailable(isEthAddress(value));
    } else {
      setEthAddressAvailable(false);
    }
    
    setRecipientId(value.trim());
  }, []);

  return (
    <Modal
      className='app--accounts-Modal'
      header={t<string>('rSwap')}
      size='large'
    >
      <Modal.Content>
        <div className={className}>
          <Modal.Description>
            <p>
              The bridge will charge a fee for transfering your tokens, it is a estimated fee, calculated by the gas fee of Ethereum, 
              and the fee will be withdrawn from your transfered account, determined when the transaction is finalized.
            </p>
          </Modal.Description>
          <Modal.Columns>
            <Modal.Column>
              <InputAddress
                defaultValue={propSenderId}
                help={t<string>('The account you will swap funds from.')}
                isDisabled={!!propSenderId}
                label={t<string>('swap from account')}
                labelExtra={
                  <Available
                    label={transferrable}
                    params={senderId}
                  />
                }
                onChange={setSenderId}
                type='account'
              />
            </Modal.Column>
            <Modal.Column>
              <p>{t<string>('The swapped balance will be subtracted (along with fees) from the sender account.')}</p>
            </Modal.Column>
          </Modal.Columns>
          <Modal.Columns>
            <Modal.Column>
              <InputBalance
                autoFocus
                help={t<string>('Type the amount you want to swap. Note that you can select the unit on the right e.g sending 1 milli is equivalent to sending 0.001.')}
                isError={!hasAvailable}
                isZeroable
                label={t<string>('swap amount')}
                onChange={setAmount}
              />
              <Input
                  help={t<string>('The amount swapped to ethereum')}
                  isDisabled
                  label={t<string>('to ethereum')}
                  value={amount?.div(BN_TEN.pow(new BN(formatBalance.getDefaults().decimals + si.power))).toString()}
                >
                  <Dropdown
                    defaultValue={t<string>('erc20')}
                    dropdownClassName='ui--SiDropdown'
                    isButton
                    options={[{ text: t<string>('FIS-ERC20'), value: 'erc20' }]}
                  />
                </Input>
              <Static
                help={t<string>('The estimated fee for sending transactions to ethereum smart contracts.')}
                label={t<string>('estimated fee')}
              >
                <FormatBalance
                  value={chainFees}
                >
                </FormatBalance>
              </Static>
            </Modal.Column>
            {/* <Modal.Column>
              <p>{t<string>('Likewise if the sending account balance drops below the same value, the account will be removed from the state.')}</p>
              <p>{t('The account will be removal due to low balances.')}</p>
            </Modal.Column> */}
          </Modal.Columns>
          <Modal.Columns>
            <Modal.Column>
              <Input
                help={t<string>('The ethereum address you want to swap funds to (starting by "0x")')}
                label={t<string>('ethereum address')}
                isError={!ethAddressAvailable}
                onChange={onChangeEthereumAddress}
                value={recipientId || ''}
              />
            </Modal.Column>
            {/* <Modal.Column>
              <p>{t<string>('The beneficiary will have access to the transferred fees when the transaction is included in a block.')}</p>
            </Modal.Column> */}
          </Modal.Columns>
        </div>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={senderId}
          icon='paper-plane'
          isDisabled={!hasAvailable || !ethAddressAvailable || (amount == undefined ? true : amount <= BN_ZERO)}
          label={t<string>('Make Swap')}
          onStart={onClose}
          params={
            [amount, recipientId, ethChainId]
          }
          tx={
              'bridgeSwap.transferNative'
          }
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(styled(Swap)`
  .ui--SiDropdown {
    background: transparent;
    border-color: rgba(34, 36, 38, .15) !important;
    border-style: dashed;
    color: #666 !important;
    cursor: default !important;
    font-size: 8rem;

    .icon {
      display: none;
    }
  }

  .balance {
    margin-bottom: 0.5rem;
    text-align: right;
    padding-right: 1rem;

    .label {
      opacity: 0.7;
    }
  }

  label.with-help {
    flex-basis: 10rem;
  }

`);
