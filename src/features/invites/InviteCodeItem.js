import React from 'react';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { SendHorizonal } from 'lucide-react';
import { Label } from 'ui/label';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from 'ui/input-group';
import { ResendForm } from './ResendForm';

export const InviteCodeItem = ({ invite, showResend = true }) => {
  const { code, useCount, maxUses, roleId, roleName } = invite;
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const [isCopied, setIsCopied] = React.useState(false);
  const [showResendForm, setShowResendForm] = React.useState(false);

  const url = `https://cpic.dev/register/${code}`;

  const handleCopy = () => {
    copyToClipboard(url);
    setIsCopied(true);
  };

  React.useEffect(() => {
    if (copiedText) {
      const timeout = setTimeout(() => setIsCopied(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [copiedText]);

  return (
    <div>
      <InputGroup>
        <InputGroupInput placeholder={url} readOnly id={`invite-${code}`} />
        <InputGroupAddon align='block-start'>
          <Label htmlFor={`invite-${code}`} className='text-foreground'>
            {`Role: ${roleName}`}
          </Label>
          <InputGroupText>
            {`${maxUses - useCount} use(s) remaining`}
          </InputGroupText>
          <div className='ml-auto flex gap-1'>
            <InputGroupButton
              aria-label='Copy link'
              title='Copy link'
              size='icon-xs'
              onClick={handleCopy}
            >
              {isCopied ? <IconCheck /> : <IconCopy />}
            </InputGroupButton>
            {showResend && (
              <InputGroupButton
                aria-label='Resend invite'
                title='Resend to more emails'
                size='icon-xs'
                onClick={() => setShowResendForm((prev) => !prev)}
              >
                <SendHorizonal className='h-4 w-4' />
              </InputGroupButton>
            )}
          </div>
        </InputGroupAddon>
      </InputGroup>
      {showResendForm && (
        <ResendForm code={code} onSuccess={() => setShowResendForm(false)} />
      )}
    </div>
  );
};
