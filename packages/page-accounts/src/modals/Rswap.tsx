// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Balance } from '@polkadot/types/interfaces';
import { Option } from '@polkadot/types';

import BN from 'bn.js';
import React, { useState } from 'react';
import styled from 'styled-components';
import { InputAddress, InputBalance, Input, Modal, Static, TxButton } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';
import { Available, FormatBalance } from '@polkadot/react-query';
import { BN_ZERO } from '@polkadot/util';

import { useTranslation } from '../translate';

interface Props {
  className?: string;
  onClose: () => void;
  senderId?: string;
}

const transformChainFees = {
  transform: (value: Option<Balance>) => value.unwrapOr(null)
};

const ethChainId = 2;

function Swap ({ className = '', onClose, senderId: propSenderId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [amount, setAmount] = useState<BN | undefined>(BN_ZERO);
  const [hasAvailable] = useState(true);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);

  const chainFees = useCall<Balance | null>(api.query.bridgeCommon.chainFees, [ethChainId], transformChainFees);

  const transferrable = <span className='label'>{t<string>('transferrable')}</span>;

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
              <InputBalance
                // defaultValue={amount ? amount.sub(chainFees ? chainFees.toBn() : BN_ZERO) : BN_ZERO}
                defaultValue={amount}
                help={t<string>('')}
                isDisabled
                label={t<string>('to ethereum')}
              />
              <Static
                help={t<string>('The estimated fee for sending transactions to Ethereum smart contracts.')}
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
                help={t<string>('The Ethereum address you want to swap funds to.')}
                label={t<string>('ethereum address')}
                onChange={setRecipientId}
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
          isDisabled={!hasAvailable || !recipientId || (amount == undefined ? true : amount <= BN_ZERO)}
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

  .typeToggle {
    text-align: right;
  }

  .typeToggle+.typeToggle {
    margin-top: 0.375rem;
  }
`);
