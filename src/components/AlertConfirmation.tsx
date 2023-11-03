import { AlertConfirmationProps, ButtonTypes } from '@/types';
import React from 'react';
import Dialog from './Dialog';
import Button from './Button';

const AlertConfirmation: React.FC<AlertConfirmationProps> = ({
  show,
  children,
  firstButtonText = 'Ok',
  secondButtonText,
  firstButtonHandler,
  secondButtonHandler = () => {},
}) => {
  return show ? (
    <Dialog>
      <div className='flex flex-col gap-4 py-2'>
        {children}
        <div className='flex justify-end gap-5'>
          <Button label={firstButtonText} onClick={firstButtonHandler} />
          {secondButtonText && (
            <Button
              label={secondButtonText}
              onClick={secondButtonHandler}
              type={ButtonTypes.secondary}
            />
          )}
        </div>
      </div>
    </Dialog>
  ) : null;
};

export default AlertConfirmation;
