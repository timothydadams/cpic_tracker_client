import * as React from 'react';
import { Button } from 'catalyst/button.jsx';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from 'catalyst/dialog.jsx';
import { Text } from 'catalyst/text.jsx';

export const Modal = ({
  buttonText,
  title = null,
  description = null,
  children,
  ...props
}) => {
  let [isOpen, setIsOpen] = React.useState(false);

  console.log('props in modal:', props);

  return (
    <>
      <Button type='button' plain onClick={() => setIsOpen(true)}>
        {buttonText}
      </Button>
      <Dialog {...props} open={isOpen} onClose={setIsOpen}>
        {title && <DialogTitle>{title}</DialogTitle>}
        {description && <DialogDescription>{description}</DialogDescription>}
        <DialogBody>{children}</DialogBody>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
