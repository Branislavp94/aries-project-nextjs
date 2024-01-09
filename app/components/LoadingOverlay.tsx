import React from 'react'
import styles from '@/styles/loadingStyle.module.css'
import LoadingIndicator from './LoadingIndicator';

const LoadingOverlay = () => {
  return (
    <div className={styles['loading-overlay-modal-bg']}>
      <div className={styles['load-ovl-text']}>
        <LoadingIndicator />
      </div>
    </div>
  );
}

export default LoadingOverlay