import React from 'react';
import { Button } from 'catalyst/button';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from 'catalyst/dialog';
import { SidebarItem, SidebarLabel } from 'catalyst/sidebar.jsx';
import Markdown from 'react-markdown';
import { MarkdownWrapper } from './MarkdownWrapper';
import remarkGfm from 'remark-gfm';

import privacyContent from './PrivacyNotice.md';
import tosContent from './TOS.md';

export const ModalFromMarkdown = ({
  title,
  description,
  Icon,
  file = 'privacy',
}) => {
  const [markdownContent, setMarkdownContent] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (file == 'privacy') {
      setMarkdownContent(privacyContent);
    } else {
      setMarkdownContent(tosContent);
    }
  }, []);

  return (
    <>
      <SidebarItem aria-label={title} onClick={() => setIsOpen(true)}>
        {Icon}
        <SidebarLabel>{title}</SidebarLabel>
      </SidebarItem>

      <Dialog open={isOpen} onClose={setIsOpen} size='2xl'>
        <DialogBody>
          <MarkdownWrapper className='max-h-[500px] overflow-y-auto'>
            <Markdown remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>
          </MarkdownWrapper>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>I agree</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
