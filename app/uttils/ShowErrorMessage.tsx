// ShowErrorMessage.tsx
import React, { FC } from 'react';
import ErrorStyle from '@/styles/formStyles.module.css';

interface Props {
  errorMessage: string | null
}

const ShowErrorMessage: FC<Props> = ({ errorMessage }) => {
  return (
    <div className={`${ErrorStyle['error-container']}`}>
      <span className={`${ErrorStyle['error-inside']}`}>{errorMessage}</span>
    </div>
  );
};

export default ShowErrorMessage;
