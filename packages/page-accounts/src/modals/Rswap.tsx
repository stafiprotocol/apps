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
import { BN_ZERO, BN_TEN, isBn, formatBalance } from '@polkadot/util';
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

const BN_TEN_DECIMALS = new BN(1_000_000);
function reformat (value: string | BN, isDisabled?: boolean): string {
  if (isBn(value)) {
    // format for 6 decimals (align with util)
    let fmt = (value.mul(BN_TEN_DECIMALS).div(BN_TEN.pow(new BN(formatBalance.getDefaults().decimals))).toNumber() / 1000000).toFixed(6);

    while (fmt.length !== 1 && ['.', '0'].includes(fmt[fmt.length - 1])) {
      const isLast = fmt.endsWith('.');

      fmt = fmt.substr(0, fmt.length - 1);

      if (isLast) {
        break;
      }
    }

    return fmt;
  }

  return formatBalance(value, { forceUnit: '-', withSi: false }).replace(',', isDisabled ? ',' : '');
}


const ethChainId = 2;

function Swap ({ className = '', onClose, senderId: propSenderId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [amount, setAmount] = useState<BN | undefined>(BN_ZERO);
  const [ethValue, setEthValue] = useState<string | null>('0');
  const [hasAvailable] = useState(true);
  const [ethAddressAvailable, setEthAddressAvailable] = useState(false);
  // const [ethLinkAvailable, setEthLinkAvailable] = useState(false);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);

  const chainFees = useCall<Balance | null>(api.query.bridgeCommon.chainFees, [ethChainId], transformChainFees);

  const transferrable = <span className='label'>{t<string>('transferrable')}</span>;

  const onChangeEthereumAddress = useCallback((value: string) => {
    if (value && value.length == 42) {
      setEthAddressAvailable(isEthAddress(value));
    } else {
      setEthAddressAvailable(false);
    }
    
    setRecipientId(value.trim());
  }, []);

  const onChangeSwapAmount = useCallback((value: BN | undefined) => {
    setAmount(value);
    if (value) {

      try {
        let ethValue = reformat(value, true);
        setEthValue(ethValue);
      } catch (error) {
        
      }
      
    }
  }, []);

  const clickSwapLink = () => {
    if (ethAddressAvailable && recipientId) {
      window.open('https://etherscan.io/token/0xef3a930e1ffffacd2fc13434ac81bd278b0ecc8d?a=' + recipientId);
    }
  };

  return (
    <Modal
      className='app--accounts-Modal'
      header={t<string>('rBridge')}
      size='large'
    >
      <Modal.Content>
        <div className={className}>
          <Modal.Description>
            <p>
              This is a beta version of rBridge, use it on your own risk. It is a one way bridge, you can swap native FIS to ERC20 FIS, it is not supportive to swap it back, two way bridge is under development.
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
                isZeroable={false}
                label={t<string>('swap amount')}
                onChange={onChangeSwapAmount}
              />
            </Modal.Column>
          </Modal.Columns>
          <Modal.Columns>
            <Modal.Column>
              <Input
                  help={t<string>('The amount swapped to ethereum')}
                  isDisabled
                  label={t<string>('to ethereum')}
                  value={ethValue}
                >
                  <Dropdown
                    defaultValue={t<string>('erc20')}
                    dropdownClassName='ui--SiDropdown'
                    isButton
                    options={[{ text: t<string>('FIS-ERC20'), value: 'erc20' }]}
                  />
              </Input>
            </Modal.Column>
            <Modal.Column>
              <p>{t<string>('The amount of ERC20 FIS you will receive on ethereum.')}</p>
            </Modal.Column>
          </Modal.Columns>
          <Modal.Columns>
            <Modal.Column>
              <Static
                help={t<string>('The estimated fees for sending transactions to ethereum smart contracts.')}
                label={t<string>('estimated fees')}
              >
                <FormatBalance
                  value={chainFees}
                >
                </FormatBalance>
              </Static>
            </Modal.Column>
            <Modal.Column>
              <p>{t<string>('The bridge will charge a certain amout of FIS to cover the ETH gas fee paid by StaFi for sending ERC20 FIS to your ETH address. We will calulate the estimated fee based on the exchange rate of ETH gas charged and FIS token at the real time. Estimated fee will be deducted from your transfered account.')}</p>
            </Modal.Column>
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
            <Modal.Column>
              <p>{t<string>('Your ethereum address to receive ERC20 FIS.')}</p>
            </Modal.Column>
          </Modal.Columns>

          <Modal.Columns>
            <Modal.Column>
              <p>
                {
                  ethAddressAvailable ? (
                  <span>
                    <span className="swap-link">
                      {t<string>('Click on this ')}
                    </span>
                    <span className="link" onClick={clickSwapLink}>
                      {t<string>('link')}
                    </span>
                    <span>
                      {t<string>(' to check your swap status.')}
                    </span>
                  </span>
                  ) : null
                }
              </p>
            </Modal.Column>
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
            api.tx.bridgeSwap.transferNative
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

  .swap-link {
    margin-left: 2rem;
  }

  .link {
    cursor: pointer;
    color: #00F3AB;
    text-decoration: underline;
  }

`);
