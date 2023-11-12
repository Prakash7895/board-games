import React from 'react';

const Tooltip: React.FC<{
  children: React.ReactNode;
  tooltip: string;
}> = ({ children, tooltip }) => {
  return (
    <div className='tooltip tooltip-info' data-tip={tooltip}>
      {children}
    </div>
  );
};

export default Tooltip;
