// src/components/SupportButtons.tsx
import React from 'react';
import { 
  ThumbLikeRegular, 
  ThumbLikeFilled, 
  ThumbDislikeRegular, 
  ThumbDislikeFilled 
} from '@fluentui/react-icons';

type SupportButtonsProps = {
  supportStatus: boolean | null;
  supportCount: number;
  onUpvote: () => void;
  onDownvote: () => void;
  variant?: 'post' | 'comment'; // Different styling variants
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
};

const SupportButtons: React.FC<SupportButtonsProps> = ({
  supportStatus,
  supportCount,
  onUpvote,
  onDownvote,
  variant = 'post',
  showCount = true,
  size = 'medium',
}) => {
  // Calculate icon size based on the size prop
  const getIconSize = () => {
    switch(size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };
  
  // Calculate styles based on variant and size
  const getContainerStyle = () => {
    if (variant === 'post') {
      return {
        display: 'flex',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        overflow: 'hidden',
      };
    } else {
      return {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      };
    }
  };

  const getButtonStyle = (isActive: boolean) => {
    const baseStyle = {
      background: 'transparent',
      border: 'none',
      padding: size === 'small' ? '5px' : size === 'large' ? '15px' : '10px',
      cursor: 'pointer',
      color: isActive ? 'var(--accent-color, #3390ec)' : 'var(--text-color, white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    return baseStyle;
  };

  const iconSize = getIconSize();

  return (
    <div style={getContainerStyle()}>
      <button
        onClick={onUpvote}
        style={getButtonStyle(supportStatus === true)}
        aria-label="Upvote"
      >
        {supportStatus === true ? 
          <ThumbLikeFilled fontSize={iconSize} /> : 
          <ThumbLikeRegular fontSize={iconSize} />
        }
      </button>
    
      {showCount && variant === 'comment' && (
        <span style={{ 
          padding: '0 5px', 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: variant === 'comment' ? '12px' : '14px',
          opacity: 0.8 
        }}>

          {supportCount}
        </span>
      )}
      
      {variant === 'post' && (
        <div style={{ width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}></div>
      )}
      
      <button
        onClick={onDownvote}
        style={getButtonStyle(supportStatus === false)}
        aria-label="Downvote"
      >
        {supportStatus === false ? 
          <ThumbDislikeFilled fontSize={iconSize} /> : 
          <ThumbDislikeRegular fontSize={iconSize} />
        }
      </button>
    </div>
  );
};

export default SupportButtons;